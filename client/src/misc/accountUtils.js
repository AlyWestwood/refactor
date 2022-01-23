import React from 'react';
import { Row, Col } from 'react-bootstrap';

function getSymbol(currency){
    return currency === 'EUR' ?
    '€' : currency === 'GBP' ?
        '£' : '$';
}

function assignTransaction(transaction, accountId){
    const fundsIn = transaction.payeeAccount === accountId;
    const currency = fundsIn ? transaction.targetCurrency : transaction.originCurrency;
    const symbol = getSymbol(currency)
    

    return fundsIn ? 
        <><Row><Col className='text-start'>{parseDateTime(transaction.createdAt)} : received from #{transaction.payerAccount}</Col><Col sm={3} className='text-end'>{symbol}{transaction.targetValue} {transaction.targetCurrency}</Col></Row></> :
        <><Row><Col className='text-start'>{parseDateTime(transaction.createdAt)} : paid to #{transaction.payeeAccount}</Col><Col sm={3} className='text-end'>-{symbol}{transaction.originValue} {transaction.originCurrency}</Col></Row></> ;
}

// function assignRecurring(recurring, accountId){
//     const fundsIn = recurring.payeeAccount === accountId;
//     const currency = fundsIn ? recurring.targetCurrency : recurring.originCurrency;
//     const symbol = getSymbol(currency)
    

//     return fundsIn ? 
//         <><Row><Col className='text-start'>{parseDate(recurring.createdAt)} : received from #{recurring.payerAccount}</Col><Col sm={3} className='text-end'>{symbol}{recurring.targetValue} {recurring.targetCurrency}</Col></Row></> :
//         <><Row><Col className='text-start'>{parseDate(recurring.createdAt)} : paid to #{recurring.payeeAccount}</Col><Col sm={3} className='text-end'>-{symbol}{recurring.originValue} {recurring.originCurrency}</Col></Row></> ;
// }

function parseDateTime(date){
    const formatDate = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true});
    let dateObject = new Date(Date.parse(date));
    return formatDate.format(dateObject);
}

function parseDate(date){
    console.log(date)
    let dateObject = new Date(Date.parse(date));
    dateObject.setUTCHours(dateObject.getHours() +5) //manually removing timezone offset
    const formatDate = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric'});
    return formatDate.format(dateObject);
}

function displayDays(days){
    days = parseInt(days)
    switch(days){
        case 1: return 'daily';
        case 7: return 'weekly';
        case 14: return 'biweekly';
        default: break;
    }
    if(days % 7 === 0){return 'every ' + (days / 7) + ' weeks'}
    return 'every ' + days + ' days';
}

export { parseDateTime, parseDate, assignTransaction, getSymbol, displayDays }; 