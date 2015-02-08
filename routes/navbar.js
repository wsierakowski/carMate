module.exports = function(curItem) {
  var menu = {
    items: [{
        name: 'Consumption',
        link: '/consumption'
      }, {
        name: 'Car',
        link: '/car'
      }, {
        name: 'User Account',
        link: '/useraccount'
      }, {
        name: 'Logout',
        link: '/logout'
    }]
  };

  if (curItem) menu.curItem = curItem;
  return menu;
};