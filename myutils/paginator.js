var _ = require('underscore');

module.exports = function(curPage, totalCount, itemsPerPage, buttonsNum){

    // TODO: cleanup and validation

    var res = [], i;

    var pagesNum = Math.ceil(totalCount / itemsPerPage);

    // If there is less pages than buttons
    if (itemsPerPage >= pagesNum) {
        for (i = 1; i <= pagesNum; i++) {
            res.push({
                name: i.toString(),
                disabled: i === curPage
            });
        }
        return res;
    }

    var buttonsOnSide = Math.floor(buttonsNum / 2);
    var shiftBy = 0;

    var leftCheck = curPage - buttonsOnSide;
    if (leftCheck <= 0) shiftBy = -1 * leftCheck + 1;

    var rightCheck = curPage + buttonsOnSide;
    console.log(rightCheck, pagesNum);
    if (rightCheck > pagesNum) {
        shiftBy = -(rightCheck - pagesNum);
    }

    console.log('shiftBy:', shiftBy);

    var startPos = curPage + shiftBy - buttonsOnSide;
    for (i = startPos; i < startPos + itemsPerPage; i++) {
        res.push({
            name: i.toString(),
            disabled: i === curPage
        });
    }

    return res;
};


/*
itemsPerPage = 5;
pagesNum = 7;
totalCount = 35;

curPage = 3;


1 | 2 | 3 | 4 | 5 | 6 | 7

    x
                    x

===================
var paginator = require('./myutils/paginator.js')(2, 7, 5, 5);
paginator(2, 7, 5, 5)

require('./myutils/paginator.js')(1, 35, 5, 5);

 */

