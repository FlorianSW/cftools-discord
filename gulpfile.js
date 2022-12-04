const {series, dest} = require('gulp');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

async function clean() {
    const del = await import('del');
    return del.deleteAsync('dist/**', {force: true});
}

function tsc() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(dest("dist"));
}

exports.default = series(clean, tsc);
