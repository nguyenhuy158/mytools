export interface OdooField {
  name: string;
  string: string;
  type: string;
  required: boolean;
  readonly: boolean;
  store: boolean;
  help?: string;
  selection?: [string, string][];
  relation?: string;
  domain?: any;
  // Extra attributes
  compute?: string;
  inverse?: string;
  search?: string;
  related?: string;
  company_dependent?: boolean;
  groups?: string;
  depends?: string[];
  manual?: boolean;
}

export interface OdooModel {
  model: string;
  name: string;
}

export interface OdooConnectionParams {
  url: string;
  db: string;
  username: string;
  password: string;
  model: string;
}

async function authenticateOdoo(baseUrl: string, db: string, username: string, password: string): Promise<number> {
  const jsonRpcUrl = `${baseUrl}/jsonrpc`;
  const authPayload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "common",
      method: "authenticate",
      args: [db, username, password, {}],
    },
    id: Math.floor(Math.random() * 1000000),
  };

  const authRes = await fetch(jsonRpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(authPayload),
  });

  if (!authRes.ok) {
    throw new Error(`Failed to connect to Odoo: ${authRes.statusText}`);
  }

  const authData = await authRes.json() as any;

  if (authData.error) {
    throw new Error(`Authentication failed: ${authData.error.data?.message || authData.error.message}`);
  }

  const uid = authData.result;

  if (!uid) {
    throw new Error("Authentication failed: No UID returned (check credentials)");
  }
  return uid;
}

export async function fetchOdooModels(params: Omit<OdooConnectionParams, 'model'>): Promise<OdooModel[]> {
  const { url, db, username, password } = params;
  const baseUrl = url.replace(/\/$/, "");
  const jsonRpcUrl = `${baseUrl}/jsonrpc`;
  
  const uid = await authenticateOdoo(baseUrl, db, username, password);

  // Search read on ir.model
  const searchPayload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [
        db,
        uid,
        password,
        "ir.model",
        "search_read",
        [[]], // empty domain to get all
        { 
          fields: ["model", "name"],
          limit: 0 
        }
      ],
    },
    id: Math.floor(Math.random() * 1000000),
  };

  const searchRes = await fetch(jsonRpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchPayload),
  });

  if (!searchRes.ok) {
    throw new Error(`Failed to fetch models: ${searchRes.statusText}`);
  }

  const searchData = await searchRes.json() as any;

  if (searchData.error) {
    throw new Error(`Error fetching models: ${searchData.error.data?.message || searchData.error.message}`);
  }

  return searchData.result;
}

export async function fetchOdooFields(params: OdooConnectionParams): Promise<Record<string, OdooField>> {
  const { url, db, username, password, model } = params;
  
  // Ensure URL doesn't have trailing slash
  const baseUrl = url.replace(/\/$/, "");
  const jsonRpcUrl = `${baseUrl}/jsonrpc`;

  const uid = await authenticateOdoo(baseUrl, db, username, password);

  // 1. Fetch Fields via fields_get (Standard runtime definition)
  const fieldsPayload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [
        db,
        uid,
        password,
        model,
        "fields_get",
        [],
        { 
          attributes: [
            "string", "help", "type", "readonly", "required", "store", 
            "selection", "relation", "domain",
            // Some versions might support these, but we also fetch from ir.model.fields to be sure
            "compute", "inverse", "search", "related", "company_dependent", "groups", "depends", "manual"
          ] 
        }
      ],
    },
    id: Math.floor(Math.random() * 1000000),
  };

  // 2. Fetch metadata from ir.model.fields (Source of truth for method names)
  const irFieldsPayload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [
        db,
        uid,
        password,
        "ir.model.fields",
        "search_read",
        [[["model", "=", model]]],
        {
          fields: ["name", "compute", "related", "depends"], // inverse is usually not stored in DB, but compute and related are
          limit: 0
        }
      ],
    },
    id: Math.floor(Math.random() * 1000000),
  };

  const [fieldsRes, irFieldsRes] = await Promise.all([
    fetch(jsonRpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fieldsPayload),
    }),
    fetch(jsonRpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(irFieldsPayload),
    })
  ]);

  if (!fieldsRes.ok) throw new Error(`Failed to fetch fields: ${fieldsRes.statusText}`);
  const fieldsData = await fieldsRes.json() as any;
  if (fieldsData.error) throw new Error(`Error fetching fields: ${fieldsData.error.data?.message || fieldsData.error.message}`);

  const fieldsResult = fieldsData.result as Record<string, OdooField>;

  // Enrich with ir.model.fields data if available
  if (irFieldsRes.ok) {
    const irFieldsData = await irFieldsRes.json() as any;
    if (!irFieldsData.error && Array.isArray(irFieldsData.result)) {
      irFieldsData.result.forEach((irField: any) => {
        const fieldName = irField.name;
        if (fieldsResult[fieldName]) {
          // If fields_get didn't return compute/related/depends, fill it from ir.model.fields
          if (!fieldsResult[fieldName].compute && irField.compute) {
            fieldsResult[fieldName].compute = irField.compute;
          }
          if (!fieldsResult[fieldName].related && irField.related) {
            fieldsResult[fieldName].related = irField.related;
          }
          if (!fieldsResult[fieldName].depends && irField.depends) {
             // depends in ir.model.fields might be a string or array? usually string in older, but let's check
             // Actually depends is often not stored in ir.model.fields directly as a list.
             // But 'compute' field often contains the code, not just the name in some contexts.
             // Wait, standard Odoo: compute is the method NAME.
          }
        }
      });
    }
  }

  // Note: 'inverse' is often not exposed via fields_get nor stored in ir.model.fields (it's in Python code).
  // If fields_get returned it, great. If not, we can't easily get it via standard JSON-RPC without 'eval' or special server methods.
  // However, we rely on fields_get 'attributes' request doing its best.

  return fieldsResult;
}
