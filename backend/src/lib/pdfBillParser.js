const { spawn } = require('child_process');
const path = require('path');

/**
 * Calls the existing pdf_parser.py script to extract electricity units from a PDF bill.
 * Returns a promise that resolves to { electricity_units, calculated_consumption }
 */
function parsePdfBill(filePath) {
  return new Promise((resolve, reject) => {
    const scriptDir = process.env.PYTHON_SCRIPT_DIR || path.join(__dirname, '../../../');
    const scriptPath = path.resolve(scriptDir, 'pdf_parser.py');

    const py = spawn('python', [scriptPath, filePath]);
    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (data) => { stdout += data.toString(); });
    py.stderr.on('data', (data) => { stderr += data.toString(); });

    py.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`pdf_parser.py exited with code ${code}: ${stderr}`));
      }
      try {
        const result = JSON.parse(stdout);
        if (result.error) return reject(new Error(result.error));
        resolve({
          electricity_units: result.electricity_units,
          calculated_consumption: result.calculated_consumption
        });
      } catch (e) {
        reject(new Error('Failed to parse pdf_parser.py output: ' + stdout));
      }
    });
  });
}

module.exports = { parsePdfBill };
