import { useState, useEffect } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import { useTranslation } from "react-i18next";
import { Database, Search, AlertCircle, Check, RotateCw, RefreshCw, Calculator, Globe, Link as LinkIcon, Users, Package, ArrowLeftRight } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { fetchOdooFields, fetchOdooModels, type OdooField, type OdooModel } from "../../utils/odoo";
import { useLocalStorageHistory } from "../../utils/history";
import { HistorySection } from "../../components/HistorySection";

export function meta() {
  return [
    { title: "Odoo Field Inspector" },
    { name: "description", content: "Inspect Odoo model fields via JSON-RPC." },
  ];
}

interface ConnectionDetails {
  url: string;
  db: string;
  username: string;
  model: string;
  // Intentionally excluding password
  timestamp: number;
}

type ActionResponse = {
  intent: "inspect" | "load_models";
  fields?: Record<string, OdooField>;
  models?: OdooModel[];
  error?: string;
  connection?: Omit<ConnectionDetails, "timestamp">;
};

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get("intent") as "inspect" | "load_models" || "inspect";
  const url = formData.get("url") as string;
  const db = formData.get("db") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const model = formData.get("model") as string;

  if (!url || !db || !username || !password) {
    return { error: "URL, Database, Username, and Password are required", intent };
  }

  try {
    if (intent === "load_models") {
      const models = await fetchOdooModels({ url, db, username, password });
      return { models, intent };
    } else {
      // inspect
      if (!model) {
        return { error: "Model Name is required", intent };
      }
      const fields = await fetchOdooFields({ url, db, username, password, model });
      // Return the successful connection details (minus password) so client can save to history
      return { 
        fields,
        intent,
        connection: { url, db, username, model }
      };
    }
  } catch (e) {
    return { error: (e as Error).message, intent };
  }
}

export default function OdooInspector() {
  const { t } = useTranslation();
  const actionData = useActionData<ActionResponse>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // Determine which action is loading based on the submitted form data
  const formData = navigation.formData;
  const intent = formData?.get("intent");
  const isInspectLoading = isSubmitting && (!intent || intent === "inspect");
  const isModelsLoading = isSubmitting && intent === "load_models";

  const { history, setHistory, clearHistory, removeFromHistory } = useLocalStorageHistory<ConnectionDetails>("odoo-inspector-history");

  const [formState, setFormState] = useState({
    url: "",
    db: "",
    username: "",
    password: "",
    model: ""
  });

  const [availableModels, setAvailableModels] = useState<OdooModel[]>([]);
  const [fieldsFilter, setFieldsFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");

  // Effect to handle action responses
  useEffect(() => {
    if (actionData?.error) return;

    if (actionData?.intent === "load_models" && actionData.models) {
      setAvailableModels(actionData.models);
    }

    if (actionData?.intent === "inspect" && actionData.connection) {
       const { url, db, username, model } = actionData.connection;
       setHistory(prev => {
        // Dedup: remove identical existing entry
        const filtered = prev.filter(item => 
          !(item.url === url && item.db === db && item.username === username && item.model === model)
        );
        return [{
          url, db, username, model, timestamp: Date.now()
        }, ...filtered].slice(0, 10); // Keep last 10
      });
      
      // Update form state to match what was submitted (if not already)
      setFormState(prev => ({ ...prev, url, db, username, model }));
    }
  }, [actionData, setHistory]);

  const handleRestoreHistory = (item: ConnectionDetails) => {
    setFormState(prev => ({
      ...prev,
      url: item.url,
      db: item.db,
      username: item.username,
      model: item.model,
      // Keep existing password if present
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const filteredFields = actionData?.fields 
    ? Object.entries(actionData.fields).filter(([name, field]) => {
        const search = fieldsFilter.toLowerCase();
        return name.toLowerCase().includes(search) || field.string.toLowerCase().includes(search);
      }).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    : [];

  const filteredModels = availableModels.filter(m => 
    m.model.toLowerCase().includes(modelFilter.toLowerCase()) || 
    m.name.toLowerCase().includes(modelFilter.toLowerCase())
  ).slice(0, 100); // Limit dropdown size

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title={t("odoo_inspector.title")}
          description={t("odoo_inspector.description")}
        />

        {/* Top Section: Form and History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection Form */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              {t("odoo_inspector.title")}
            </h2>
            
            <Form method="post" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("odoo_inspector.labels.url")}
                  </label>
                  <input
                    name="url"
                    type="url"
                    value={formState.url}
                    onChange={handleInputChange}
                    placeholder="https://odoo.example.com"
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("odoo_inspector.labels.db")}
                  </label>
                  <input
                    name="db"
                    type="text"
                    value={formState.db}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("odoo_inspector.labels.username")}
                  </label>
                  <input
                    name="username"
                    type="text"
                    value={formState.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("odoo_inspector.labels.password")}
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={formState.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("odoo_inspector.labels.model")}
                  </label>
                  <button 
                    type="submit" 
                    name="intent" 
                    value="load_models"
                    disabled={isModelsLoading || isInspectLoading}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
                    title="Load available models from Odoo"
                  >
                    {isModelsLoading ? <RotateCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Load Models
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    name="model"
                    type="text"
                    list="odoo-models"
                    value={formState.model}
                    onChange={(e) => {
                        handleInputChange(e);
                        setModelFilter(e.target.value);
                    }}
                    placeholder="e.g. res.partner"
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    autoComplete="off"
                  />
                  {availableModels.length > 0 && (
                    <datalist id="odoo-models">
                      {filteredModels.map(m => (
                        <option key={m.model} value={m.model}>{m.name} ({m.model})</option>
                      ))}
                    </datalist>
                  )}
                </div>
                {availableModels.length > 0 && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> {availableModels.length} models loaded
                    </p>
                )}
              </div>

              <button
                type="submit"
                name="intent"
                value="inspect"
                disabled={isInspectLoading || isModelsLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isInspectLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {t("odoo_inspector.actions.inspect")}
              </button>

              {actionData?.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{actionData.error}</span>
                </div>
              )}
            </Form>
          </div>

          {/* History Section */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm h-full flex flex-col">
            <HistorySection
              history={history}
              onRestore={handleRestoreHistory}
              onRemove={removeFromHistory}
              onClear={clearHistory}
              title="Recent Connections"
              clearLabel="Clear All"
              renderItem={(item) => (
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                      {item.model}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.url} • {item.db}
                    </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="w-full">
          {actionData?.fields ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Field Definitions ({Object.keys(actionData.fields).length})
                </h3>
                
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Filter fields..." 
                      value={fieldsFilter}
                      onChange={(e) => setFieldsFilter(e.target.value)}
                      className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                    />
                </div>
              </div>
              
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 font-medium bg-gray-50 dark:bg-gray-800">{t("odoo_inspector.table.name")}</th>
                      <th className="px-6 py-3 font-medium bg-gray-50 dark:bg-gray-800">{t("odoo_inspector.table.label")}</th>
                      <th className="px-6 py-3 font-medium bg-gray-50 dark:bg-gray-800">{t("odoo_inspector.table.type")}</th>
                      <th className="px-6 py-3 font-medium bg-gray-50 dark:bg-gray-800 text-center" title="Required">Req</th>
                      <th className="px-6 py-3 font-medium bg-gray-50 dark:bg-gray-800 text-center" title="Readonly">RO</th>
                      <th className="px-6 py-3 font-medium bg-gray-50 dark:bg-gray-800 text-center" title="Store">Store</th>
                      <th className="px-6 py-3 font-medium bg-gray-50 dark:bg-gray-800">{t("odoo_inspector.table.relation")}</th>
                      <th className="px-6 py-3 font-medium bg-gray-50 dark:bg-gray-800">{t("odoo_inspector.table.compute")}</th>
                      <th className="px-6 py-3 font-medium bg-gray-50 dark:bg-gray-800">{t("odoo_inspector.table.inverse")}</th>
                      <th className="px-6 py-3 font-medium bg-gray-50 dark:bg-gray-800">{t("odoo_inspector.table.related")}</th>
                      <th className="px-6 py-3 font-medium bg-gray-50 dark:bg-gray-800">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredFields.map(([fieldName, field]) => (
                      <tr key={fieldName} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-6 py-3 font-mono text-blue-600 dark:text-blue-400 font-medium">
                          {fieldName}
                        </td>
                        <td className="px-6 py-3 text-gray-900 dark:text-gray-100 max-w-[200px] truncate" title={field.string}>
                          {field.string}
                        </td>
                        <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium border border-gray-200 dark:border-gray-700">
                            {field.type}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          {field.required && <Check className="w-4 h-4 text-green-500 mx-auto" />}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {field.readonly && <Check className="w-4 h-4 text-gray-400 mx-auto" />}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {field.store && <Check className="w-4 h-4 text-gray-400 mx-auto" />}
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">
                          {field.relation && (
                            <div className="flex items-center gap-1">
                              <LinkIcon className="w-3 h-3 text-gray-400" />
                              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{field.relation}</code>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono max-w-xs truncate">
                          {field.compute && (
                            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400" title={`Compute: ${field.compute}`}>
                              <Calculator className="w-3 h-3" />
                              <span className="truncate">{field.compute}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono max-w-xs truncate">
                          {field.inverse && (
                            <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400" title={`Inverse: ${field.inverse}`}>
                              <ArrowLeftRight className="w-3 h-3" />
                              <span className="truncate">{field.inverse}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono max-w-xs truncate">
                          {field.related && (
                            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400" title={`Related: ${field.related}`}>
                              <Globe className="w-3 h-3" />
                              <span className="truncate">{field.related}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs">
                          <div className="flex flex-col gap-1">
                            {field.selection && (
                              <div className="truncate" title={JSON.stringify(field.selection)}>
                                {field.selection.length} options
                              </div>
                            )}
                            {field.help && (
                              <div className="truncate max-w-[150px]" title={field.help}>
                                {field.help}
                              </div>
                            )}
                            {field.groups && (
                              <div className="flex items-center gap-1 text-red-500" title={`Groups: ${field.groups}`}>
                                <Users className="w-3 h-3" />
                                <span className="truncate max-w-[100px]">Restricted</span>
                              </div>
                            )}
                            {field.company_dependent && (
                              <div className="flex items-center gap-1 text-blue-500" title="Company Dependent">
                                <Package className="w-3 h-3" />
                                <span>Company Dep.</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                      {filteredFields.length === 0 && (
                        <tr>
                          <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                             No fields found matching "{fieldsFilter}"
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-400">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Data Loaded</h3>
              <p className="max-w-sm">Enter connection details and click Inspect to view field definitions for an Odoo model.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
