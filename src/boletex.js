boletex = {
	/*
	 * Faz a limpeza da linha digitável tirando todos os pontos e espaços
	 */
	unformat : function(linha) {
		return linha.replace(/[^0-9]/g,'');
	},
	/*
	 * Converte linha digitável para código de barras
	 */	
	linhaToBarra : function(linha)
	{
		barra  = this.unformat(linha)

		if (barra.length < 47 )
			barra = barra + '00000000000'.substr(0,47-barra.length);

		if (barra.length != 47)
			return false

		barra  = barra.substr(0,4)
				+barra.substr(32,15)
				+barra.substr(4,5)
				+barra.substr(10,10)
				+barra.substr(21,10);

		if (this.modulo11(barra) != barra.substr(4,1))
			return false;

		return(barra);
	},
	/*
	 * Converte código de barras em linha digitável
	 */	
	barraToLinha : function (barra)
	{
		linha = this.unformat(barra);

		if (linha.length != 44)
			return false

		var campo1 = linha.substr(0,4)+linha.substr(19,1)+'.'+linha.substr(20,4);
		var campo2 = linha.substr(24,5)+'.'+linha.substr(24+5,5);
		var campo3 = linha.substr(34,5)+'.'+linha.substr(34+5,5);
		var campo4 = linha.substr(4,1);		// Digito verificador
		var campo5 = linha.substr(5,14);	// Vencimento + Valor


		if (this.modulo11(linha) != campo4 )
			return false

		if (campo5 == 0)
			campo5 = '000';

		linha =	 campo1 + this.modulo10(campo1)
			  +' '
			  +campo2 + this.modulo10(campo2)
			  +' '
			  +campo3 + this.modulo10(campo3)
			  +' '
			  +campo4
			  +' '
			  +campo5;
		
		return(linha);
	},
	/*
	 * Converte fator de vencimento para data no formado DD/MM/AAAA
	 * Fator contado a partir da data base 07/10/1997
	 * Ex: 04/07/2000 fator igual a = 1001
	 */	
	fatorToData : function (dias) {

		var currentDate, t, dia, mes;

		t = new Date();
		currentDate = new Date();
		currentDate.setFullYear(1997,9,7);

		t.setTime(currentDate.getTime() + (1000 * 60 * 60 * 24 * dias));

		dia = (t.getDate());
		if (dia < 10)
			dia = "0" + dia;

		mes = (t.getMonth()+1);
		if (mes < 10)
			mes = "0" + mes;

		return(dia+'/'+mes+'/'+t.getFullYear());
	},
	/*
	 * Converte data no formado DD/MM/AAAA para fator de vencimento
	 * Fator contado a partir da data base 07/10/1997
	 * Ex: 04/07/2000 fator igual a = 1001
	 */	
	dataToFator : function(data)
	{
		dataAtual = new Date();
		dataAtual.setFullYear(data.substr(6,4),data.substr(3,2)-1, data.substr(0,2));
		dataBase = new Date();
		dataBase.setFullYear(1997,9, 6);

		var fator = ((dataAtual.getTime() - dataBase.getTime()) / 24 / 60 / 60 / 1000);

		fator = String(parseInt(fator, 10));
		zeros = "0000";
		console.log(zeros.substr(0,4-fator.length) + fator);

		return(zeros.substr(0,4-fator.length) + fator);
	},
	/*
	 * Calcula verificador com modulo10
	 */	
	modulo10 : function (numero)
	{
		numero = this.unformat(numero);
		var soma  = 0;
		var peso  = 2;
		var contador = numero.length-1;
		
		while (contador >= 0) {
			multiplicacao = ( numero.substr(contador,1) * peso );

			if (multiplicacao >= 10) 
				multiplicacao = 1 + (multiplicacao-10);

			soma = soma + multiplicacao;

			if (peso == 2) {
				peso = 1;
			} else {
				peso = 2;
			}
			contador = contador - 1;
		}
		var digito = 10 - (soma % 10);
		
		if (digito == 10)
			digito = 0;

		return digito;
	},
	/*
	 * Calcula verificador com modulo11
	 */	
	modulo11 : function (numero)
	{
		numero = this.unformat(numero)
		numero = numero.substr(0,4)+numero.substr(5,39)
		
		var soma  = 0;
		var peso  = 2;
		var base  = 9;
		var resto = 0;
		var contador = numero.length - 1;
		
		for (var i=contador; i >= 0; i--) {
			
			soma = soma + ( numero.substring(i,i+1) * peso);
			
			if (peso < base) {
				peso++;
			} else {
				peso = 2;
			}
		}
		var digito = 11 - (soma % 11);
		
		if (digito >  9) digito = 0;
		/* Utilizar o dígito 1(um) sempre que o resultado do cálculo padrão for igual a 0(zero), 1(um) ou 10(dez). */
		if (digito == 0) digito = 1;
		return digito;
	},
	/*
	 * Troca fator de vencimento de um código de barras
	 */	
	changeFator: function(barra, newFator)
	{
		return barra.substr(0,5)+newFator+barra.substr(9,39);
	},
	/*
	 * Troca digito verificador do fator de vencimento
	 */	
	changeDv : function(barra, dv)
	{
		return barra.substr(0,4)+dv+barra.substr(5,39)
	},
	reboleta : function (linha, newData)
	{
		//Troca o fator da barra passando a linha digitavel convertida em codigo de barras e a nova data convertida em fator de vencimento
		var barra = this.changeFator(this.linhaToBarra(this.unformat(linha)), this.dataToFator(newData));

		//Calcula o digito verificador do novo código de barras e altera na barra e retorna
		return this.barraToLinha(this.changeDv(barra, this.modulo11(barra)));
	}
};

module.exports = boletex;