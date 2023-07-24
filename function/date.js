//jshint esversion:6
// console.log(module);
// this is our own date module create check app.js where we imported as date =require(__dirname,"/date.jconst

exports.getDate = function () {
  const today = new Date();
  const options = { weekday: "long", day: "numeric", month: "long" };
  return today.toLocaleDateString("en-US", options);
};

exports.getDay = function () {
  const today = new Date();
  const options = { weekday: "long" };
  return today.toLocaleDateString("en-US", options);
};
