export interface Holiday {
  date: string; // DD/MM/YYYY
  lunarDate?: string; // DD/MM/YYYY
  name: string;
  type: "solar" | "lunar";
}

function parseCSV(csvText: string): Holiday[] {
  const lines = csvText.trim().split("\n");
  const holidays: Holiday[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line, handling quoted fields
    const fields: string[] = [];
    let currentField = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(currentField);
        currentField = "";
      } else {
        currentField += char;
      }
    }
    fields.push(currentField); // Add last field

    if (fields.length >= 4) {
      holidays.push({
        date: fields[0].trim(),
        lunarDate: fields[1].trim(),
        name: fields[2].trim(),
        type: fields[3].trim() as "solar" | "lunar",
      });
    }
  }

  return holidays;
}

export async function loader() {
  try {
    // Read CSV file from public directory
    const csvPath = new URL("../../public/data/holidays-2026.csv", import.meta.url);
    const csvText = await Bun.file(csvPath.pathname).text();
    const holidays = parseCSV(csvText);

    return Response.json({ holidays });
  } catch (error) {
    console.error("Error loading holidays:", error);
    return Response.json({ holidays: [], error: "Failed to load holidays" }, { status: 500 });
  }
}
