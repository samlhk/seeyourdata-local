const jsonToMd = (json) => {
  // TODO process db.json -> db.md here with code regarding db.json's structure
  const md = [];

  if (json.location) {
    json.location.forEach(({label, source}) => {
      md.push(`user accessed location: ${label} through source: ${source}`)
    })
  }

  return md.join('\n');
}

module.exports.jsonToMd = jsonToMd;