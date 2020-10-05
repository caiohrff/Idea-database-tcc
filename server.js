const express = require('express')
const server = express()
const mysql = require('mysql')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')

server.use(bodyParser.json())

nunjucks.configure('src/views', {
    autoescape: true,
    express: server,
    watch: true,
})

/*CONNECTION*/
const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password: 'root',
    database: 'ideadb',
    multipleStatements: true
})

mysqlConnection.connect((err) =>{
    if(!err){
        console.log('sucessfied connection')
    }else{
        console.log('Fail connection: ' + json.stringify(err, undefined, 2))
    }
})

/*END CONNECTION*/


server.use(express.static("public"))
server.use(express.urlencoded({extended: true}))
server.set('view engine', '.njk')

//ROUTS

server.get('/', (req, res) => {
    res.sendFile(__dirname + "/src/index.html")
})


server.get("/formulario", (req, res) =>{
    res.sendFile(__dirname + "/src/formIdea.html")

})

server.get("/index", (req, res) =>{
    res.sendFile(__dirname + "/src/index.html")
})

//Resultado de ideias do usuário. - Inserir filtro futuramente
server.get('/resultado', (req, res) =>{

    mysqlConnection.query('SELECT FormDetalhes FROM ideasform', (err, rows) => {

            const resultado = JSON.stringify(rows)
            const json = JSON.parse(resultado)
            console.log(json)    

        if(!err){
            const total = rows.length
            return res.render('telaResultado', { result: json, total: total})
           
        }else{
            console.log(err)
        }
      })
    
})

server.post("/principal", (req, res) =>{
    const user = req.body.nome
    const pass = req.body.senha

    
    mysqlConnection.query('SELECT EmpUser, EmpDepartament FROM employee WHERE EmpUser = "' + user +'" AND EmpPassword = "' + pass +'"',  (err, rows, field) =>{
       rows[0].EmpDepartament

        if(!err){
            if(rows.length > 0){
                        if(rows[0].EmpDepartament === 'Tecnologia' || rows[0].EmpDepartament === 'Gestor da inovacao'){
                             res.sendFile(__dirname + "/src/principalGestor.html")
                        }else{
                             res.sendFile(__dirname + "/src/principalFunc.html")
                        }
            }else{
                res.sendFile(__dirname + "/src/index2.html")
            }
        }else{
            console.log(err)
        }
    })
})

server.post("/resultadoformulario", (req, res) =>{
        
    const DadosForm ={
        FormEmployeeRa: req.body.ra,
        FormEmployeeSetor: req.body.setor,
        FormDetalhes: req.body.detalhes,
        FormEmployeeNome: req.body.nome,
        FormEmployeeCargo: req.body.cargo,
        FormAssunto: req.body.assunto
    }
        mysqlConnection.query('INSERT INTO ideasform SET ?', DadosForm,(err, rows) => {
            if(!err){
                console.log('INSERIDO')
                //SWEETALERT
                
            }else{
                console.log(err)
            }
          })
    })

    server.get("/rh", (req, res) =>{
        res.render('TelaRH.njk');
    })

    server.post("/rhResults", (req, res) =>{
        // const totalPd = 
        // const totaHorasPd = 
        // const totalCustoAnual = 
        // const totalHoras = 

        const dadosRH = {
        dedicacao: req.body.dedicacao,
        formacao: req.body.formacao,
        colaborador: req.body.colaborador,
        CPF: req.body.cpf,
        funcao: req.body.funcaoExercicio,
        admissao: req.body.DataAdmissao,
        demissao: req.body.DataDemissao,
        custoAnual: req.body.custoAnual,
        custoHora: req.body.custoHora,
        horasPD: req.body.horasPD,
        custo: req.body.custoPD
       }
       //Exibindo no console os dados brutos do req.body

       console.log(req.body)
    })

// END ROUTS


server.listen(3000, ()=>{
    console.log("iniciado!!")
})