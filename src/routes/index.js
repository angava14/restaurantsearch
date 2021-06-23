const {Router} = require('express');
const router = Router();
const pg = require('pg');
const jwt = require('jsonwebtoken');
const axios = require ('axios');
const cs = 'postgres://postgres:951401alonso@database.chja0jmmjujj.us-east-1.rds.amazonaws.com:5432/andresgarces';
const client = new pg.Client(cs);

    //FORMAT OF REQUEST
    // {user, password}
router.post('/api/login' , async (req,res) => {
    client.connect();
        try{

            const sql = "select  * from public.users where usuario ='"+req.body.user+"' and contrasena = '"+req.body.password+"'";
            client.connect();
            const response = await client.query(sql)
            console.log(response.rows);
            console.log(response.rowCount)
                if(response.rowCount > 0){
                    const user = {
                        password:req.body.password,
                        user:req.body.user
                    }
                    jwt.sign({user} , 'secretkey' , (err,token)=>{
                        res.json({
                            response,
                            token
                        })
                    });
                }else{
                    res.json({
                        message:'Usuario o contraseña invalida'
                    })
                }

 
         
        }catch(e){
            res.send({message:'Error ' + e});
    }
    
    client.end();
});

    //FORMAT OF REQUEST
    // {user , password, name}
router.post('/api/signIn' , async (req,res) => {
    client.connect();
        try{
            const sql = "insert into public.users(nombre, usuario, contrasena) values ('"+req.body.name+"','"+req.body.user+"','"+req.body.password+"');"
            console.log(sql);
            client.connect();
            const response = await client.query(sql)

            if(response.rowCount >0){
                const user = {
                    name: req.body.name,
                    password:req.body.password,
                    user:req.body.user
                }
        
                jwt.sign({user} , 'secretkey' , (err,token)=>{
                    res.json({
                        response,
                        token
                    })
                });
            }else{
                res.json({
                    response
                })
            }
 
           
        }catch (e){
            res.send({message:'Error ' + e});
        }
        client.end();
    });


    //FORMAT OF REQUEST
    //{city, location:"longitud,latitud"}
router.post('/api/searchRestaurants', verifyToken,  async (req, res) => {  
        client.connect();
        try{
           jwt.verify(req.token, 'secretkey' , (err, authData) => {
            if(err) {
                res.sendStatus(403);
              } else {

                const city = req.body.city;
                const coords = req.body.location;
                console.log('llega aqui');
                axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+${city}&location=${coords}&radius=10000&key=AIzaSyB3Ng3uNISIVJNPjAHhdxY6oY_at_Ot4sk`)
                .then( result =>{
                    res.send(result.data.results)
                })
                

              }
           });

        }catch (err){
            res.send(err);
        }
        client.end()
    });

    //FORMAT OF REQUEST
    // {user}
router.get('/api/getRecords' , async (req,res) =>{
   client.connect();
   try{
    const sql = "select * from  public.historico where  usuario = '"+req.body.user+"';"
    const result = await client.query(sql)
    if(result.rowCount > 0){
            res.json({
                result
            })
    }else{
        res.json({
            message:'Error: Could not find Users:'
        })
    }
   }catch(err){
    res.json({
        message:'Error: ' + err
    })
   }
   client.end();  
});


   // FORMAT OF TOKEN
   // Authorization: Bearer <access_token>
   
   //Verify Token
function verifyToken(req,res,next){
       
    const bearerHeader = req.headers['authorization'];
  
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken; 
        next();
    }else{
        // Forbidden
        res.json({
            message:"Debe autenticarse primero"
        });
    }
}


module.exports = router;