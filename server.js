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

server.get('/resultado', (req, res) =>{

    mysqlConnection.query('SELECT FormDetalhes FROM ideasform', (err, rows) => {

            const resultado = JSON.stringify(rows)
            const json = JSON.parse(resultado)   

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
            let totalPdCost = custoPD1 + custoPD2

            let custoHors1 = +(dadosRH1.hoursCost.replace(/,/,'.'))
            let custoHors2 = +(dadosRH2.hoursCost.replace(/,/,'.')) 
            let totalPdHours = custoHors1 + custoHors2
            
            let custoAno1 = +(dadosRH1.annualCost.replace(/,/,'.'))
            let custoAno2 = +(dadosRH2.annualCost.replace(/,/,'.')) 
            let totalAnualCost = custoAno1 + custoAno2
            
            let totalHoraPD1 = +(dadosRH1.pdHours.replace(/,/,'.'))
            let totalHoraPD2 = +(dadosRH2.pdHours.replace(/,/,'.'))
            let totalHours = totalHoraPD1 + totalHoraPD2

            dadosRH1.totalPdCost = totalPdCost
            dadosRH1.totalPdHours = totalPdHours
            dadosRH1.totalAnualCost = totalAnualCost
            dadosRH1.totalHours = totalHours

            dadosRH2.totalPdCost = totalPdCost
            dadosRH2.totalPdHours = totalPdHours
            dadosRH2.totalAnualCost = totalAnualCost
            dadosRH2.totalHours = totalHours

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

    server.get('/contratados', (req, res) =>{
        res.render('contratados.njk');

    })

    server.post('/contratadosResults', (req, res) =>{

            const dadosContratados01 = {}
            const dadosContratados02 = {}
            
            const dadosContratados = {
            cnpjContracted: req.body.CNPJ,
            nameContracted: req.body.nomeInstituicao,
            descriptionContracted: req.body.descritivo,
            InvoiceContracted: req.body.notaFiscal,
            projectContracted: req.body.projeto,
            dateIssuanceContracted: req.body.dataEmissao,
            valueContracted: req.body.valor,
            institutionContracted: req.body.instituto
        }

            Object.entries(dadosContratados).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    dadosContratados01[key] = value[0]
                    dadosContratados02[key] = value[1]                
                    }            
                })

            let valor01 = +(dadosContratados01.valueContracted.replace(/,/,'.'))
            let valor02 = +(dadosContratados02.valueContracted.replace(/,/,'.'))  
            let totalContracted = valor01 + valor02

            dadosContratados01.totalContracted = totalContracted
            dadosContratados02.totalContracted = totalContracted


            mysqlConnection.query('INSERT INTO contracted SET ?', dadosContratados01, (err, rows) => {
                if(!err){
                    console.log("INSERIDO DADOS 01")
                    mysqlConnection.query('INSERT INTO contracted SET ?', dadosContratados02, (err, rows) => {
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

    server.get('/transferidos', (req, res) =>{
        res.render('transferidos.njk');

    })

    server.post("/transferidosResults", (req, res) =>{

        const dadosTransferred01 = {}
        const dadosTransferred02 = {}

        const dadosTransferred = {
            cnpjTransferred: req.body.CNPJ,
            nameTransferred: req.body.nomeInstituicao,
            descriptionTransferred: req.body.descritivo,
            InvoiceTransferred: req.body.notaFiscal,
            projectTransferred: req.body.projeto,
            dateIssuanceTransferred: req.body.dataEmissao,
            valueTransferred: req.body.valor,
            institutionTransferred: req.body.empresa
        }

                Object.entries(dadosTransferred).forEach(([key, value]) =>{
                    if(Array.isArray(value)){
                        dadosTransferred01[key] = value[0]
                        dadosTransferred02[key] = value[1]
                    }
                })

                let valor01 = +(dadosTransferred01.valueTransferred.replace(/,/,'.'))
                let valor02 = +(dadosTransferred02.valueTransferred.replace(/,/,'.'))  
                let totalTransferred = valor01 + valor02

                dadosTransferred01.totalTransferred = totalTransferred
                dadosTransferred02.totalTransferred = totalTransferred

                mysqlConnection.query('INSERT INTO transferred SET ?', dadosTransferred01, (err, rows) => {
                    if(!err){
                        console.log("INSERIDO DADOS 01")
                        mysqlConnection.query('INSERT INTO transferred SET ?', dadosTransferred02, (err, rows) => {
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

    server.get("/expense", (req, res) =>{
        res.render('outrasDespesas.njk');
    })

    server.post("/expenseResults", (req, res) =>{
        const dadosExpense01 = {}
        const dadosExpense02 = {}

        const dadosExpense = {
            cnpjExpenses: req.body.CNPJ,
            nameExpenses: req.body.nomeInstituicao,
            descriptionExpenses: req.body.descritivo,
            invoiceExpenses: req.body.notaFiscal,
            projectExpenses: req.body.projeto,
            dataIssuanceExpenses: req.body.dataEmissao,
            valueExpenses: req.body.valor,
            optionExpenses: req.body.empresaDespesas
        }

        Object.entries(dadosExpense).forEach(([key, value]) =>{
            if(Array.isArray(value)){
                dadosExpense01[key] = value[0]
                dadosExpense02[key] = value[1]
            }
        })

        let valorExpense01 = +(dadosExpense01.valueExpenses.replace(/,/,'.'))
        let valorExpense02 = +(dadosExpense02.valueExpenses.replace(/,/,'.'))  
        let totalExpenses = valorExpense01 + valorExpense02

        dadosExpense01.totalExpenses = totalExpenses
        dadosExpense02.totalExpenses = totalExpenses

        mysqlConnection.query('INSERT INTO anotherexpenses SET ?', dadosExpense01, (err, rows) => {
            if(!err){
                console.log("INSERIDO DADOS 01")
                mysqlConnection.query('INSERT INTO anotherexpenses SET ?', dadosExpense02, (err, rows) => {
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

    server.get("/consumption", (req, res) =>{
        res.render('consumo.njk');
    })

    server.post("/consumptionResults", (req, res)=>{
        const dadosConsumption01 = {}
        const dadosConsumption02 = {}

        const dadosConsumption = {
            cnpjConsumption: req.body.CNPJ,
            nameConsumption: req.body.nomeInstituicao,
            projectConsumption: req.body.projeto,
            descriptionConsumption: req.body.descritivo,
            invoiceConsumption: req.body.notaFiscal,
            dataIssuanceConsumption: req.body.dataEmissao,
            valueConsumption: req.body.valor,
        }

        Object.entries(dadosConsumption).forEach(([key, value]) =>{
            if(Array.isArray){
                dadosConsumption01[key] = value[0]
                dadosConsumption02[key] = value[1]
            }
        })

        let valorConsumption01 = +(dadosConsumption01.valueConsumption.replace(/,/,'.'))
        let valorConsumption02 = +(dadosConsumption02.valueConsumption.replace(/,/,'.'))  
        let totalConsumption = valorConsumption01 + valorConsumption02 //PERSISTIR NO BANCO

        dadosConsumption01.totalConsumption = totalConsumption
        dadosConsumption02.totalConsumption = totalConsumption


        mysqlConnection.query('INSERT INTO consumption SET ?', dadosConsumption01, (err, rows) => {
            if(!err){
                console.log("INSERIDO DADOS 01")
                mysqlConnection.query('INSERT INTO consumption SET ?', dadosConsumption02, (err, rows) => {
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

    server.get("/searchResults", (req, res) =>{
        res.render("searchResults.njk") // tela para procurar a ideia


        const search = req.body.SearcResults

        if(search == ""){
            return res.render("página de retorno de resultados", {total: 0})
        }

        mysqlConnection.query('',  (err, rows, field) =>{
            if(!err){

                }else{
                    console.log(err)
                }
        })
    })
    

    server.post("allResultsSearch", (req, res) =>{
        
    })
// END ROUTS


server.listen(3000, ()=>{
    console.log("iniciado na porta 3000")
})