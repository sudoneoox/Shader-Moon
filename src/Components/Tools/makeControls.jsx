function makeControls(vert, frag) {
  const controls = `
    ${vert}
    ${frag}
  `
    .split('\n')
    .filter((x) => x.indexOf('uniform') > -1)
    .map((x) => x.match(/uniform (.+?) (.+?);.+(\/\/.+)/m))
    .filter((x) => x)
    .map((match) => {
      return {
        type: match[1],
        name: match[2],
        controls: JSON.parse(match[3].replace('// ', ''))
      };
    });
  console.log(controls);
  return controls.reduce((controls, control) => {
    controls[control.name] = control.controls;
    return controls;
  }, {});
}

export default makeControls;
