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
        <><Row><Col className='text-start'>{parseDate(transaction.createdAt)} : received from #{transaction.payerAccount}</Col><Col sm={3} className='text-end'>{symbol}{transaction.targetValue} {transaction.targetCurrency}</Col></Row></> :
        <><Row><Col className='text-start'>{parseDate(transaction.createdAt)} : paid to #{transaction.payeeAccount}</Col><Col sm={3} className='text-end'>-{symbol}{transaction.originValue} {transaction.originCurrency}</Col></Row></> ;
}

function parseDate(date){
    const formatDate = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true});
    let dateObject = new Date(Date.parse(date));
    return formatDate.format(dateObject);
}

export { parseDate, assignTransaction, getSymbol }; 