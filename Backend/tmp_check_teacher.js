(async function(){
  try{
    const loginResp = await fetch('http://localhost:5000/api/auth/login',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seed.teacher@school.com', password: 'teacher123' })
    });
    const loginJson = await loginResp.json();
    console.log('LOGIN', JSON.stringify(loginJson));
    if(!loginJson?.token){
      console.error('No token returned');
      process.exit(1);
    }
    const meResp = await fetch('http://localhost:5000/api/teachers/me',{
      headers: { Authorization: 'Bearer ' + loginJson.token }
    });
    const meJson = await meResp.json();
    console.log('ME', JSON.stringify(meJson, null, 2));
  }catch(e){
    console.error('ERR', e);
    process.exit(1);
  }
})();