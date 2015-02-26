var formUtils = {};

/**
 * Use with the form input element to make sure only numbers are allowed.
 * Example:
 * <input name="id" type="text" onkeypress="return formUtils.isNumberKey(event)"/>
 */
formUtils.isNumberKey = function(e){
  var charCode = (e.which) ? e.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57))
    return false;
  return true;
};