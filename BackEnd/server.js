const express = require("express");
const app = express();


const {
  readReceptionData,
  saveReceptionData,
  readGraphData,
  saveGraphData
} = require("./modules/storage");

const {
  generateGraphData
} = require("./modules/statistics");


app.use(express.json());
app.use(express.static("src/frontend"));



app.post("/salvar", (req, res) => {
  try {
    const newData = req.body;

    const receptionData =
      readReceptionData();

    receptionData.push(newData);

    saveReceptionData(receptionData);


    const graphData =
      generateGraphData(
        receptionData
      );

    saveGraphData(graphData);

    res.json({
      message: "Salvo com sucesso"
    });



  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }

});

app.get("/grafico", (req, res) => {

  const graphData =
    readGraphData();

  res.json(graphData);
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});