function parseDate(date){
    const formatDate = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true});
    let dateObject = new Date(Date.parse(date));
    return formatDate.format(dateObject);

}

module.exports = { parseDate }