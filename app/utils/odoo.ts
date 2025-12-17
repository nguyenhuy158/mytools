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

  // 2. Fetch Fields
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
          attributes: ["string", "help", "type", "readonly", "required", "store", "selection", "relation", "domain"] 
        }
      ],
    },
    id: Math.floor(Math.random() * 1000000),
  };

  const fieldsRes = await fetch(jsonRpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fieldsPayload),
  });

  if (!fieldsRes.ok) {
    throw new Error(`Failed to fetch fields: ${fieldsRes.statusText}`);
  }

  const fieldsData = await fieldsRes.json() as any;

  if (fieldsData.error) {
    throw new Error(`Error fetching fields: ${fieldsData.error.data?.message || fieldsData.error.message}`);
  }

  return fieldsData.result;
}
