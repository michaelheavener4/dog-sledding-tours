import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const operators = JSON.parse(readFileSync(join(root, "data/operators.json"), "utf8"));
const types = new Set(["ride-along", "drive-your-own", "overnight", "kennel-tour"]);
const states = new Set(["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY"]);
const bases = new Set(["per-person", "per-sled", "mixed", "unspecified"]);
const errors = [];
const ids = new Set();

if (!Array.isArray(operators)) errors.push("operators.json must be an array");
else {
  if (operators.length < 40) errors.push(`need at least 40 operators, found ${operators.length}`);
  for (const op of operators) {
    const where = op.id || op.name || "(missing id)";
    for (const key of ["id","name","state","town","summary","website","bookingUrl","sources"]) {
      if (op[key] === undefined || op[key] === null || op[key] === "") errors.push(`${where}: missing ${key}`);
    }
    if (op.id) {
      if (ids.has(op.id)) errors.push(`duplicate id ${op.id}`);
      ids.add(op.id);
      if (!/^[a-z0-9-]+$/.test(op.id)) errors.push(`${where}: id must be kebab-case`);
    }
    if (op.state && !states.has(op.state)) errors.push(`${where}: bad state ${op.state}`);
    if (!Array.isArray(op.tourTypes) || op.tourTypes.length === 0) errors.push(`${where}: tourTypes required`);
    else for (const t of op.tourTypes) if (!types.has(t)) errors.push(`${where}: bad tour type ${t}`);
    if (op.driveYourOwn !== true && op.driveYourOwn !== false && op.driveYourOwn !== null) errors.push(`${where}: driveYourOwn`);
    if (op.kidFriendly !== true && op.kidFriendly !== false && op.kidFriendly !== null) errors.push(`${where}: kidFriendly`);
    for (const banned of ["phone","email","rating","reviews","stars"]) {
      if (op[banned] != null) errors.push(`${where}: do not store ${banned}`);
    }
    const hasPrice = op.priceMin != null || op.priceMax != null || (op.priceNote && /\d/.test(op.priceNote));
    if (hasPrice && !/^\d{4}-\d{2}-\d{2}$/.test(op.priceAsOf || "")) errors.push(`${where}: priceAsOf required`);
    if (!hasPrice && op.priceAsOf) errors.push(`${where}: priceAsOf set without a price`);
    if (op.priceMin != null && (!Number.isFinite(op.priceMin) || op.priceMin < 0)) errors.push(`${where}: priceMin`);
    if (op.priceMax != null && (!Number.isFinite(op.priceMax) || op.priceMax < 0)) errors.push(`${where}: priceMax`);
    if (op.priceMin != null && op.priceMax != null && op.priceMax < op.priceMin) errors.push(`${where}: priceMax < priceMin`);
    if (op.priceBasis != null && !bases.has(op.priceBasis)) errors.push(`${where}: priceBasis`);
    if ((op.priceMin != null || op.priceMax != null) && !op.priceBasis) errors.push(`${where}: priceBasis required with numeric price`);
    if (!Array.isArray(op.sources) || op.sources.length === 0) errors.push(`${where}: sources`);
    else for (const s of op.sources) {
      if (!s.url || !/^https?:\/\//.test(s.url)) errors.push(`${where}: bad source url`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s.retrieved || "")) errors.push(`${where}: source retrieved date`);
    }
    for (const urlKey of ["website","bookingUrl"]) {
      if (op[urlKey] && !/^https?:\/\//.test(op[urlKey])) errors.push(`${where}: ${urlKey} must be http(s)`);
    }
    if (op.partnerUrl != null && op.partnerUrl !== "" && !/^https?:\/\//.test(op.partnerUrl)) errors.push(`${where}: partnerUrl`);
    if (typeof op.summary === "string" && op.summary.length < 40) errors.push(`${where}: summary too short`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${operators.length} operators`);
