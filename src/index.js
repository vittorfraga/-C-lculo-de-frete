const express = require("express");
const app = express();
const { getStateFromZipcode } = require("utils-playground");
const produtos = require("./bancodedados/produtos");

const getProductById = (id) => {
  return produtos.find((p) => p.id == id);
};

const calculateFreightCost = async (produto, cep) => {
  try {
    const estado = await getStateFromZipcode(cep);
    let frete = produto.valor * 0.12;
    if (["BA", "SE", "AL", "PE", "PB"].includes(estado)) {
      frete = produto.valor * 0.1;
    } else if (["SP", "RJ"].includes(estado)) {
      frete = produto.valor * 0.15;
    }

    return {
      Produto: produto,
      Estado: estado,
      Frete: frete,
    };
  } catch (error) {
    throw new Error("CEP inválido");
  }
};

app.get("/produtos", (req, res) => {
  res.send(produtos);
});

app.get("/produtos/:idProduto", (req, res) => {
  const id = req.params.idProduto;
  const produto = getProductById(id);

  if (produto) {
    res.json(produto);
  } else {
    res.status(404).send("Produto não encontrado");
  }
});

app.get("/produtos/:idProduto/frete/:cep", async (req, res) => {
  const { idProduto, cep } = req.params;
  const produto = getProductById(idProduto);
  if (!produto) {
    return res.status(404).send("Produto não encontrado");
  }

  try {
    const FreightCost = await calculateFreightCost(produto, cep);
    return res.json(FreightCost);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

app.listen(3000, () => {
  console.log("API iniciada na porta 3000");
});
