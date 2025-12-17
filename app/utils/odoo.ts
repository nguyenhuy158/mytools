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

export interface OdooConnectionParams {
  url: string;
  db: string;
  username: string;
  password: string;
  model: string;
}

export async function fetchOdooFields(params: OdooConnectionParams): Promise<Record<string, OdooField>> {
  const { url, db, username, password, model } = params;
  
  // Ensure URL doesn't have trailing slash
  const baseUrl = url.replace(/\/$/, "");
  const jsonRpcUrl = `${baseUrl}/jsonrpc`;

  // 1. Authenticate
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
