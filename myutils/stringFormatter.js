exports.getDateStd = function(date, del) {
    //dd/mm/yyyy
    del = del || '/';

    return ('0' + date.getDay()).slice(-2) + del +
           ('0' + date.getMonth() + 1).slice(-2) + del +
           date.getFullYear();
};