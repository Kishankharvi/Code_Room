import axios from 'axios';

const PISTON_URL = process.env.PISTON_URL || process.env.PISTON_API || 'https://emkc.org/api/v2/piston/execute'; 

async function runCode({ language, version, code, stdin }) {
  const payload = { language, version: version || "*", files: [{ content: code }], stdin };
  const resp = await axios.post(PISTON_URL, payload, { timeout: 30000 });
  return resp.data;
}

export { runCode };
