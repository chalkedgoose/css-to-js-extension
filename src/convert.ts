import * as postcss from "postcss";

const unitlessNumberProperties: Set<string> = new Set([
  "animation-iteration-count",
  "border-image-outset",
  "border-image-slice",
  "border-image-width",
  "column-count",
  "flex",
  "flex-grow",
  "flex-positive",
  "flex-shrink",
  "flex-order",
  "grid-row",
  "grid-column",
  "font-weight",
  "line-clamp",
  "line-height",
  "opacity",
  "order",
  "orphans",
  "tab-size",
  "widows",
  "z-index",
  "zoom",
  "fill-opacity",
  "flood-opacity",
  "stop-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
]);

const camelcase = (x: string) =>
  x.replace(/-[a-z]/g, (c) => c[1].toUpperCase());

const indent = (x: string) => x.split("\n").join("\n  ");

function stringify(obj: any, isTop: any) {
  if (typeof obj === "number") {
    return String(obj);
  } else if (typeof obj === "object") {
    const lines = [];
    lines.push("{");

    const printAfter = [];
    function printProp(key: any) {
      const val = stringify(obj[key], false);
      const propKey = /[^a-zA-Z]/.test(key) ? stringify(key, false) : key;
      if (val[0] === "{" && lines.length !== 1) {
        lines.push("");
      }
      lines.push(`  ${propKey}: ${val},`);
    }
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      if (typeof obj[key] === "object") {
        printAfter.push(key);
      } else {
        printProp(key);
      }
    }
    for (const key of printAfter) {
      printProp(key);
    }

    lines.push("}");
    const res = lines.join("\n");
    if (isTop) {
      return res;
    } else {
      return indent(res);
    }
  } else if (typeof obj === "string") {
    if (obj.includes("'")) {
      return JSON.stringify(obj);
    } else {
      return "'" + obj + "'";
    }
  } else {
    throw new Error("lol");
  }
}

export default postcss.plugin("postcss-css-to-js", (options = {}) => {
  return (css) => {
    const lines = [];
    lines.push("const styles = stylex({\n");

    const styles: any = {};

    css.walkRules((rule) => {
      // get the very last suffix in the selector

      const namespaces = rule.selector.split(",");

      namespaces.forEach((item) => {
        const namespace = item
          .replace(/\n/g, " ")
          .replace(/.+\//, " ")
          .replace(/:.+$/g, "")
          .trim();
        let rules = (styles[namespace] = styles[namespace] || {});

        // get the pseudo selector if one exists
        const pseudoMatch = rule.selector.match(/:([a-z]+)$/);
        if (pseudoMatch !== null) {
          const pseudo = pseudoMatch[0];
          const pseudoRules = (rules[pseudo] = rules[pseudo] || {});
          rules = pseudoRules;
        }

        rule.walkDecls((decl) => {
          const key = camelcase(decl.prop);
          let value: string | number = decl.value;

          // Set to number if it ends in px
          if (
            unitlessNumberProperties.has(decl.prop) &&
            value.match(/^[0-9.]+(px)?$/)
          ) {
            value = parseFloat(decl.value);
          }

          // Replace var( with var(--
          if (typeof value === "string") {
            value = value.replace(/var\(/g, "var(--");
          }

          rules[key] = value;
        });
      });
    });

    css.nodes = [
      postcss.parse(`/*\n\n${stringify(styles, true)}\n\n*/`),
    ] as any;
  };
});
