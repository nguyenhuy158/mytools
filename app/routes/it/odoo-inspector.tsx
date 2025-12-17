import { Form, useActionData, useNavigation } from "react-router";
import { useTranslation } from "react-i18next";
import { Database, Search, AlertCircle, Check, RotateCw } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { fetchOdooFields, type OdooField } from "../../utils/odoo";

export function meta() {
  return [
    { title: "Odoo Field Inspector" },
    { name: "description", content: "Inspect Odoo model fields via JSON-RPC." },
  ];
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const url = formData.get("url") as string;
  const db = formData.get("db") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const model = formData.get("model") as string;

  if (!url || !db || !username || !password || !model) {
    return { error: "All fields are required" };
  }

  try {
    const fields = await fetchOdooFields({ url, db, username, password, model });
    return { fields };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export default function OdooInspector() {
  const { t } = useTranslation();
  const actionData = useActionData<{ fields?: Record<string, OdooField>; error?: string }>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  // Pre-fill some values if previously submitted (actionData doesn't persist inputs automatically in Remix unless we return them)
  // For simplicity, we can let the browser handle autocomplete or just clear on refresh.
  // Ideally we might want to controlled inputs to persist state if we want better UX, but uncontrolled is fine for now.

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title={t("odoo_inspector.title")}
          description={t("odoo_inspector.description")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Connection Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Connection Details
              </h2>
              
              <Form method="post" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("odoo_inspector.labels.url")}
                  </label>
                  <input
                    name="url"
                    type="url"
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
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("odoo_inspector.labels.model")}
                  </label>
                  <input
                    name="model"
                    type="text"
                    placeholder="e.g. res.partner"
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
          </div>

          {/* Results Area */}
          <div className="lg:col-span-2">
            {actionData?.fields ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Field Definitions ({Object.keys(actionData.fields).length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-6 py-3 font-medium">{t("odoo_inspector.table.name")}</th>
                        <th className="px-6 py-3 font-medium">{t("odoo_inspector.table.label")}</th>
                        <th className="px-6 py-3 font-medium">{t("odoo_inspector.table.type")}</th>
                        <th className="px-6 py-3 font-medium text-center">{t("odoo_inspector.table.required")}</th>
                        <th className="px-6 py-3 font-medium text-center">{t("odoo_inspector.table.readonly")}</th>
                        <th className="px-6 py-3 font-medium text-center">{t("odoo_inspector.table.store")}</th>
                        <th className="px-6 py-3 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {Object.entries(actionData.fields)
                        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                        .map(([fieldName, field]) => (
                        <tr key={fieldName} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="px-6 py-3 font-mono text-blue-600 dark:text-blue-400 font-medium">
                            {fieldName}
                          </td>
                          <td className="px-6 py-3 text-gray-900 dark:text-gray-100">
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
                                <span className="opacity-70">Relation:</span>
                                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{field.relation}</code>
                              </div>
                            )}
                            {field.selection && (
                              <div className="truncate" title={JSON.stringify(field.selection)}>
                                {field.selection.length} options
                              </div>
                            )}
                            {field.help && (
                              <div className="truncate" title={field.help}>
                                {field.help}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
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
    </div>
  );
}
