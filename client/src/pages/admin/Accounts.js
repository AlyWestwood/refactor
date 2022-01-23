import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import { reqHeader } from '../../misc/reqHeader';
import DisplayAccounts from '../../components/DisplayAccounts';



function Accounts() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    axios.get('/admin/approveCreditAccounts', reqHeader)
    .then(res => {
      setAccounts(res.data.listOfInactiveCreditAccounts);
      console.log(res.data.listOfInactiveCreditAccounts)
    })
    .catch(err => console.log(err))
  }, [])

  return (
      <>
        <Card>
          <Card.Header>

          </Card.Header>
          <Card.Body>
            <Table>
              <thead>

              </thead>
              <tbody>
          {accounts.map(account => {
            return(
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              )
            })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

      </>
    );
}

export default Accounts;
