import fs from '../fs';
import isJsFile from '../fs/utils/is-js-file';

export default async function loader(appPath, type) {
  if (type === 'routes') {
    return new Map([
      ['routes', require(`${appPath}/app/routes`).default]
    ]);
  } else {
    return new Map(
      (await fs.readdirAsync(`${appPath}/app/${type}`))
        .filter(isJsFile)
        .map(file => {
          return [
            file.replace('.js', ''),
            require(`${appPath}/app/${type}/${file}`).default
          ];
        })
    );
  }
}
