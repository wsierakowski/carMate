/**
 * @author  sigman@20150218
 *
 * Manages pagination buttons, optimized for twitter bootstrap.
 *
 * For constructor:
 * @param {Number} itemsPerPage
 * @param {Number} buttonNum
 *
 * To calculate pagination:
 * @param {Number} curPage
 * @param {Number} totalCount
 *
 * @example:
 * require('./myutils/paginator.js')(itemsPerPage, buttonsNum)(curPage, totalCount);
 *
 * require('./myutils/paginator.js')(5, 5)(6, 35);
 *
 * @returns
 * {
 *   summary: {
 *     itemsPerPage: 5,
 *     buttonsNumber: 5,
 *     totalCount: 35,
 *     currentPage: 6,
 *     pagesNumber: 7,
 *     prevPage: 5,
 *     nextPage: 7
  *  },
 *   pagination: [
 *     { name: 3, disabled: false },
 *     { name: 4, disabled: false },
 *     { name: 5, disabled: false },
 *     { name: 6, disabled: true },
 *     { name: 7, disabled: false }
 *   ]
 * }
 */

module.exports = function(itemsPerPage, buttonsNum) {

    return function(curPage, totalCount) {

        var i, pagesNum = Math.floor(totalCount / itemsPerPage);

        if (curPage > pagesNum) curPage = pagesNum;
        if (curPage < 1) curPage = 1;

        var ret = {
            pagination: []
        };

        // If there is less pages than buttons
        if (buttonsNum >= pagesNum) {
            for (i = 1; i <= pagesNum; i++) {
                ret.pagination.push({
                    name: i.toString(),
                    disabled: i === curPage
                });
            }
        } else {
            var buttonsOnSide = Math.floor(buttonsNum / 2);
            var shiftBy = 0;

            var distanceLeft = curPage - buttonsOnSide;
            if (distanceLeft <= 0) shiftBy = -distanceLeft + 1;

            var distanceRight = curPage + buttonsOnSide;

            if (distanceRight > pagesNum) {
                shiftBy = -(distanceRight - pagesNum);
            }

            var startPos = curPage + shiftBy - buttonsOnSide;
            for (i = startPos; i < startPos + buttonsNum; i++) {
                ret.pagination.push({
                    name: i.toString(),
                    disabled: i === curPage
                });
            }
        }

        ret.summary = {
            itemsPerPage: itemsPerPage,
            buttonsNumber: buttonsNum,
            totalCount: totalCount,
            currentPage: curPage,
            pagesNumber: pagesNum,
            prevPage: curPage === 1 ? null : curPage - 1,
            nextPage: curPage === pagesNum ? null : curPage + 1,
        };

        return ret;
    };
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

