const express = require('express')
const server = express()
const mysql = require('mysql')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')
const { json } = require('body-parser')

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
        if(!err){
            if(rows.length > 0){
                        if(rows[0].EmpDepartament === 'Tecnologia' || rows[0].EmpDepartament === 'Gestor da inovacao'){
                            mysqlConnection.query('SELECT EmpName FROM employee WHERE EmpUser =  "' + user,  (err, rows, field) =>{
                            console.log(rows)
                            //     console.log(rows)
                            // const usuario = JSON.stringify(rows)
                            // const json = JSON.parse(resultado)
                            // console.log(json)
                            return res.render('principalGestor')
                        })

                        }else{
                            return res.render('principalFunc')
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
        mysqlConnection.query('INSERT INTO ideasform SET ?', DadosForm, (err, rows) => {
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

        let dadosRH1 = {}
        let dadosRH2 = {}  
        
            const dadosRH = {
                employeeCPF: req.body.cpf,
                employeeName: req.body.colaborador,
                currentJob: req.body.funcaoExercicio,
                academicTraining: req.body.formacao,
                admissionDate: req.body.DataAdmissao,
                resignationDate: req.body.DataDemissao,
                dedication: req.body.dedicacao,
                annualCost: req.body.custoAnual,
                hoursCost: req.body.custoHora,
                pdHours: req.body.horasPD,
                pdCost: req.body.custoPD,
           }

           //desestruturando o objeto principal em dois POIS AGORA NOSSA MANIPULAÇÃO É FEITA A PARTIR DOS OBJETOS: dadosRH1 | dadosRH2
           Object.entries(dadosRH).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                dadosRH1[key] = value[0]
                dadosRH2[key] = value[1]                
                }            
            })

            let custoPD1 = +(dadosRH1.pdCost.replace(/,/,'.'))
            let custoPD2= +(dadosRH2.pdCost.replace(/,/,'.'))  
            let totalPdCost = custoPD1 + custoPD2 //PERSISTIR NO BANCO

            let custoHors1 = +(dadosRH1.hoursCost.replace(/,/,'.'))
            let custoHors2 = +(dadosRH2.hoursCost.replace(/,/,'.')) 
            let totalPdHours = custoHors1 + custoHors2 //PERSISTIR NO BANCO
            
            let custoAno1 = +(dadosRH1.annualCost.replace(/,/,'.'))
            let custoAno2 = +(dadosRH2.annualCost.replace(/,/,'.')) 
            let totalAnualCost = custoAno1 + custoAno2 //PERSISTIR NO BANCO
            
            let totalHoraPD1 = +(dadosRH1.pdHours.replace(/,/,'.'))
            let totalHoraPD2 = +(dadosRH2.pdHours.replace(/,/,'.'))
            let totalHours = totalHoraPD1 + totalHoraPD2 //PERSISTIR NO BANCO

            dadosRH1.totalPdCost = totalPdCost
            dadosRH1.totalPdHours = totalPdHours
            dadosRH1.totalAnualCost = totalAnualCost
            dadosRH1.totalHours = totalHours
            //-----------------------------------------------------------------
            dadosRH2.totalPdCost = totalPdCost
            dadosRH2.totalPdHours = totalPdHours
            dadosRH2.totalAnualCost = totalAnualCost
            dadosRH2.totalHours = totalHours

            console.log(dadosRH2)

        //a inserção será feita apartir das chaves e valores, não do objeto inteiro
                 
        //O PROBLEMA É A QUANTIDADE DE ARGUMENTOS PASSADOS NO INSERT
        mysqlConnection.query('INSERT INTO rh SET ?', dadosRH1, (err, rows) => {
            if(!err){
                console.log("INSERIDO DADOS 01")
                mysqlConnection.query('INSERT INTO rh SET ?', dadosRH2, (err, rows) => {
                    if(!err){
                        console.log("INSERIDO DADOS 02")
                    }else{
                        console.log(err)
                    }
                  })
            }else{
                console.log(err)
            }
          })
    })

// END ROUTS


server.listen(3000, ()=>{
    console.log("iniciado na porta 3000")
})