module.exports = async function(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  const returnSymbol = () => {
    const randomNum = Math.random();
    if (randomNum < 0.25) return "נ";
    if (randomNum < 0.5) return "ג";
    if (randomNum < 0.75) return "ה";
    else return "ש";
  };
  context.res = {
    // status: 200, /* Defaults to 200 */
    body: returnSymbol()
  };
};
