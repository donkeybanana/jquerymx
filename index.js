import $Class from './class/class.js';

const ESModel = $Class.extend('GlobalModel', {}, {});

console.log('es6', ESModel.fullName);
console.log('global', GlobalModel.fullName);

const ESChild = ESModel.extend('GlobalModel.Child', {}, {});

console.log('es6 (child)', ESChild.fullName);
console.log('global (child)', GlobalModel.Child.fullName);
