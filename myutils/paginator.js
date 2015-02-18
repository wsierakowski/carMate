/**
 * @author
 * Usage:
 * require('./myutils/paginator.js')(6, 35, 5, 5);
 *
 * Returns:
 * [
 *  { currentPage: 6, totalPages: 7, next: true, previous: true },
 *  { name: '3', disabled: false },
 *  { name: '4', disabled: false },
 *  { name: '5', disabled: false },
 *  { name: '6', disabled: true },
 *  { name: '7', disabled: false }
 * ]
 */

module.exports = function(curPage, totalCount, itemsPerPage, buttonsNum){

    // TODO: cleanup and validation

    var res = [], i;

    var pagesNum = Math.ceil(totalCount / itemsPerPage);

    if (curPage > pagesNum) curPage = pagesNum;
    if (curPage < 1) curPage = 1;

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

    var distanceLeft = curPage - buttonsOnSide;
    if (distanceLeft <= 0) shiftBy = -distanceLeft + 1;

    var distanceRight = curPage + buttonsOnSide;

    if (distanceRight > pagesNum) {
        shiftBy = -(distanceRight - pagesNum);
    }

    var startPos = curPage + shiftBy - buttonsOnSide;
    for (i = startPos; i < startPos + itemsPerPage; i++) {
        res.push({
            name: i.toString(),
            disabled: i === curPage
        });
    }

    var summary = {
        currentPage: curPage,
        totalPages: pagesNum,
        next: !res[0].disabled,
        previous: !res[res.length - 1].disabled
    };

    res.unshift(summary);

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

 */

