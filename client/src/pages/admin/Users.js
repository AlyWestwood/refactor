import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { reqHeader } from '../../misc/reqHeader';




function Users() {
    

    useEffect(() => {
        axios.get('approveUsers', reqHeader)
        .then(res => console.log(res.data))
    }, []);
  return <div></div>;
}

export default Users;
