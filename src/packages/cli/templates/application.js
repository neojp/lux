import { classify } from 'inflection';

export default (name) => {
  name = classify(name.replace('-', '_'));

  return `
import Lux from 'lux-framework';

class ${name} extends Lux {

}

export default ${name};
  `.substr(1).trim();
};
