const { ipcRenderer, remote, session } = eRequire('electron');
// const dialog = remote.dialog;
// const he = require('he');
const fse = eRequire('fs-extra');
// const os = eRequire('os');
const sqlDb = eRequire('mssql');
const axios = eRequire('axios');
const _ = eRequire('lodash');
// const https = eRequire('https');
const email = eRequire('../config/emailConfig.js');

const moment = eRequire('moment');

kendo.culture('pt-BR');
kendo.culture().calendar.firstDay = 1;

const log = require('electron-log');

const db = require('../config/dbConfig');

let destPath = 'c:\\softer\\Oruc';
if (!fse.existsSync(destPath)) {
	fse.mkdirSync(destPath);
}

// const config = {
// 	user: 'sa',
// 	password: 'sa',
// 	server: '192.168.25.170\\sqlexpress',
// 	database: 'decoteped',
// 	port: '1433',
// 	connectionTimeout: 500000,
// 	requestTimeout: 500000,
// 	pool: {
// 		idleTimeoutMillis: 500000,
// 		max: 100,
// 	},
// 	encrypt: false,
// };

const instance = axios.create({
	baseURL: 'https://www.meudatacenter.com/api/',
	// timeout: 1000,
	headers: {
		'Content-Type': 'application/json',
		'x-ID': '3011',
		'x-Token': '89s206193S553060S329961u6935s46j8919T79T7973j92s3615u32R9279S71O1942S74e1144s',
	},
});

let todaySales = 0.0,
	totalWeekSales = 0.0,
	totalMonthSales = 0.0,
	totalYearSales = 0,
	sales = [],
	pageSize = 100000,
	pageNumber = 1,
	sortCol = 'numdoc desc',
	status = 'novo',
	sDate = moment(new Date()).format('YYYY-MM-DD'),
	eDate = moment(new Date()).format('YYYY-MM-DD');

document.getElementById('iniDate').valueAsDate = new Date();
document.getElementById('finDate').valueAsDate = new Date();

$(function () {
	// $('#todaySalesDate').html(moment(new Date()).format('LL'));
	// $('#totalWeekSalesDate').html(moment().startOf('week').format('DD') + ' a ' + moment().endOf('week').format('DD [de] MMMM YYYY'));
	// $('#totalMonthSalesDate').html(moment().startOf('month').format('DD') + ' a ' + moment().endOf('month').format('DD [de] MMMM YYYY'));
	// $('#totalYearSalesDate').html(moment().startOf('year').format('DD [de] MMMM') + ' a ' + moment().endOf('year').format('DD [de] MMMM YYYY'));

	$('#todaySales').html(todaySales.toFixed(2).replace('.', ','));
	$('#totalWeekSales').html(totalWeekSales.toFixed(2).replace('.', ','));
	$('#totalMonthSales').html(totalMonthSales.toFixed(2).replace('.', ','));
	$('#totalYearSales').html(totalYearSales.toFixed(2).replace('.', ','));

	$('select.statuses').change(function () {
		status = $(this).children('option:selected').val();
		// $('#sgiSales').data('kendoGrid').dataSource.read();
		// alert("You have selected the country - " + selectedCountry);
	});

	$('#iniDate').change(function () {
		var date = this.valueAsDate;
		date.setDate(date.getDate() + 1);
		sDate = moment(new Date(date)).format('YYYY-MM-DD');
	});

	$('#finDate').change(function () {
		var date = this.valueAsDate;
		date.setDate(date.getDate() + 1);
		eDate = moment(new Date(date)).format('YYYY-MM-DD');
	});

	$('#submitButton').click(function (e) {
		e.preventDefault();
		getSGISales();
	});

	// setInterval(() => {
	// 	getOrucTodaysSalesData();
	// 	// getOrucWeekSalesData();
	// 	// getOrucMonthSalesData();
	// 	// getOrucYearSalesData();
	// }, 60000);

	// getOrucTodaysSalesData();
	// // getOrucWeekSalesData();
	// // getOrucMonthSalesData();
	// // getOrucYearSalesData();

	const sgiSales = async () => {
		await getSGISales();
	};

	sgiSales();

	// const getClients = async () => {
	// 	log.info('getting clients emails');

	// 	await getClientEmais();

	// 	log.info('Finished sending emails');
	// };

	// setTimeout(() => {
	// 	getClients();
	// }, 15000);
});

// const getClientEmais = () => {
// 	const result = new Promise((resolve, reject) => {
// 		new sqlDb.ConnectionPool(db.config)
// 			.connect()
// 			.then((pool) => {
// 				let sqlInst = `
// 					select top 275 c.codigo, c.fantasia, ltrim(rtrim(lower(replace(isnull(c.email, ''), ' ', '')))) as email into #temp
// 					from cliente c
// 					inner join CADCLICONTRATO cad on cad.codigocli = c.codigo
// 					where isnull(c.email, '') <> '' and isnull(c.classe, 1) = 1 and cad.ativo = 1
// 					order by c.fantasia;

// 					select c.codigo, c.fantasia, ltrim(rtrim(lower(replace(isnull(c.email, ''), ' ', '')))) as email
// 					from cliente c
// 					inner join CADCLICONTRATO cad on cad.codigocli = c.codigo
// 					where isnull(c.email, '') <> '' and isnull(c.classe, 1) = 1 and cad.ativo = 1
// 					and not ltrim(rtrim(lower(replace(isnull(c.email, ''), ' ', '')))) in (select email from #temp)
// 					order by c.fantasia; `;
// 				pool.request()
// 					.query(sqlInst)
// 					.then((data) => {
// 						// log.info('Clients: ', data.recordsets[0]);

// 						let clients = data.recordsets[0];

// 						if (clients.length) {
// 							log.info('Email count: ', clients.length);
// 							let count = clients.length;

// 							clients.forEach((client) => {
// 								setTimeout(() => {
// 									email.send(
// 										{
// 											text:
// 												'Caro cliente, Passamos para comunicar que devido ao feriado do Padroeiro da cidade de Governador Valadares neste Sábado, dia 13/06/2020, não iremos funcionar. Estaremos com o número do plantão funcionando. Caso precise de atendimento entrar em contato no (33) 98885-1610. Agradecemos a atenção.',
// 											from: `Softek Automatização Comercial <softek.financeiro@gmail.com>`,
// 											to: client.email,
// 											subject: 'Notificação de Feriado de 13/06/2020',
// 											attachment: [
// 												{
// 													data:
// 														'Caro cliente, Passamos para comunicar que devido ao feriado do Padroeiro da cidade de Governador Valadares neste Sábado, dia 13/06/2020, não iremos funcionar. Estaremos com o número do plantão funcionando. Caso precise de atendimento entrar em contato no <strong>(33) 98885-1610</strong>. Agradecemos a atenção.',
// 													alternative: true,
// 												},
// 											],
// 										},
// 										function (emailErr, message) {
// 											if (emailErr) {
// 												console.log(emailErr);
// 											} else {
// 												log.info('Email : ', client.email);
// 											}

// 											count = count - 1;
// 											log.info('Email count: ', count + ' ' + client.email);
// 										}
// 									);
// 								}, 3000);
// 							});
// 						} else {
// 							// console.log('Finished');
// 							resolve('success');
// 						}
// 					})
// 					.catch((err) => {
// 						console.log(err);
// 						reject(err);
// 					});
// 			})
// 			.catch((err) => {
// 				console.log(err);
// 				reject(err);
// 			});
// 	});

// 	// console.log(result);

// 	return result;
// };

const getSGISales = () => {
	const result = new Promise((resolve, reject) => {
		new sqlDb.ConnectionPool(db.config)
			.connect()
			.then((pool) => {
				let sqlInst = `
					declare @pagesize int = ${pageSize}, 
						@pagenumber int = ${pageNumber},
						@sortcol varchar(15) = '${sortCol}',
						@iniDate smalldatetime = '${sDate}',
						@finDate smalldatetime = '${eDate}';
					
					select top (@pagesize) *
					from (
						select rowid = row_number() over (
								order by case 
										when @sortCol = 'numdoc desc'
											then s.numdoc 
										end desc
									,case 
										when @sortCol = 'numdoc asc'
											then s.numdoc
										end asc
									,case 
										when @sortCol = 'cliente asc'
											then c.nome
										end asc
									,case 
										when @sortCol = 'cliente desc'
											then c.nome
										end desc
									,case 
										when @sortCol = 'data_cadastro asc'
											then s.data_cadastro
										end asc
									,case 
										when @sortCol = 'data_cadastro desc'
											then s.data_cadastro
										end desc
									,case 
										when @sortCol = 'data_alteracao asc'
											then s.data_alteracao
										end asc
									,case 
										when @sortCol = 'data_alteracao desc'
											then s.data_alteracao
										end desc
									,case 
										when @sortCol = 'valor_total_nota asc'
											then s.valor_total_nota
										end asc
									,case 
										when @sortCol = 'valor_total_nota desc'
											then s.valor_total_nota
										end desc
								)
							,s.numdoc
							,s.codicli
							,s.dtsaida
							,s.condicao
							,s.desconto
							,s.valorbru
							,s.valordin
							,s.vrchevis
							,s.vrchepre
							,s.vrcartao
							,s.numcaixa
							,s.obs
							,s.notafis
							,s.dataemi
							,s.cancelounf
							,s.cancelpor
							,s.dt_entreg
							,s.cancelada
							,s.dt_cancel
							,s.entregue
							,s.entregouem
							,s.fone
							,s.endereco
							,s.bairro
							,s.cidade
							,s.peso
							,s.codtran
							,s.condpag
							,s.[excluir - totfret]
							,s.cfop
							,s.base_icm
							,s.valor_icms
							,s.aliq_iss
							,s.base_icm_sub
							,s.valor_icm_sub
							,s.total_ipi
							,s.valor_total_serv
							,s.valor_total_prod
							,s.seguro
							,s.outras_despesas
							,s.frete
							,s.valor_total_nota
							,s.placa
							,s.uf
							,s.quantidade
							,s.especie
							,s.marca
							,s.numero
							,s.peso_bruto
							,s.peso_liquido
							,s.frete_por_conta
							,s.cod_terceiro
							,s.dados_adicionais
							,s.data_cadastro
							,s.data_alteracao
							,s.outrosdescontos
							,s.outrosacrescimos
							,s.cliente_mes_ano
							,s.tipoimp
							,s.tipoemis
							,s.nfe
							,s.numero_nfe
							,s.numeronfce
							,s.nfe_infcpl
							,s.nfe_pis_total
							,s.nfe_confins_total
							,s.transp_vserv
							,s.transp_vbcret
							,s.transp_picmsret
							,s.transp_vicmsret
							,s.transp_cfop
							,s.situacaonfe
							,s.nfe_chavedeacesso
							,s.nfe_tipodocumento
							,s.nfehomologacao
							,s.idpedido
							,s.recibonfe
							,s.protocolonfe
							,s.motivocancnfe
							,s.protocolocancnfe
							,s.numerodav
							,s.calcipi
							,s.calcvlrbcsticms
							,s.calcbcsticms
							,s.calcvlrbcicms
							,s.calcbcicms
							,s.numnotaserie
							,s.serie
							,s.subserie
							,s.modelo
							,s.vl_bc_pis
							,s.vl_bc_cofins
							,s.destacarimpostos
							,s.valoraproximp
							,s.numeronfe_serie
							,s.uf_embarque
							,s.local_embarque
							,s.emitidapelopaf
							,s.statuspedidoweb
							,s.codigo_rastreamento
							,s.motivo_cancelado
							,c.nome as cliente
							,totalrows = count(*) over()
						from dbo.saida_principal as s
						inner join cliente c on c.codigo = s.codicli
						where cfop <> '9999'
							and isnull(cancelada, 'n') <> 's'
							and isnull(denegada, 0) = 0
							and isnull(operacao, 'v') = 'v'
							and isnull(statuspedidoweb, '') = '${status}'
							and (@finDate = '' or (s.data_cadastro between @iniDate and @finDate))
							and (
								cfop in (
									select cfop
									from dbo.cfop as c
									where (cfop = s.cfop)
										and (isnull(tipo_nf, 's') = 's')
										and (isnull(naovenda, 0) = 0)
										and (isnull(devolucao, 0) = 0)
									)
								)
						) a
					where a.rowid > ((@pageNumber - 1) * @pageSize)`;
				pool.request()
					.query(sqlInst)
					.then((data) => {
						console.log('Sales: ', data.recordsets[0]);

						sales = data.recordsets[0];

						if (sales.length) {
							let salesCount = sales[0].totalrows;
							// console.log(sales.columns);

							// let columns = ['NUMDOC,ENTREGUE'];

							// $('#sgiSales').append('<tr>');
							// _.forEach(sales.columns, function (column, i) {
							// 	if (sales.columns.includes(columns)) {
							// 		$('#sgiSales').append(`<th id="id_${column.name}">${column.name}</th>`);
							// 	}
							// });
							// $('#sgiSales').append('</tr>');

							// $.each(sales.columns, function (i, item) {
							// 	if (columns.includes(item.name)) {
							// 		$('<tr>').append($('<th>').text(item.name)).appendTo('#sgiSales');
							// 	}
							// 	// console.log($tr.wrap('<p>').html());
							// });

							// $.each(sales, function (i, item) {
							// 	$('<tr>').append($('<td>').text(item.NUMDOC)).appendTo('#sgiSales');
							// 	// console.log($tr.wrap('<p>').html());
							// });
							// $('#sgiSales').data('kendoGrid').dataSource.read();
							// // $('#sgiSales').data('kendoGrid').dataSource.refresh;

							// $.each(sales, function (i, item) {
							// 	$('<tr>').append($('<td>').text(item.NUMDOC)).appendTo('#sgiSales');
							// 	// console.log($tr.wrap('<p>').html());
							// });

							// console.log(sales[0].totalrows);

							let dataSource = new kendo.data.DataSource({
								data: sales,
								schema: {
									model: {
										id: 'numdoc',
										fields: {
											numdoc: { editable: false, nullable: true },
											cliente: { editable: false, nullable: true, type: 'string' },
											numero_nfe: { editable: false, nullable: true, type: 'number' },
											valor_total_nota: { editable: false, nullable: true, type: 'number' },
											statuspedidoweb: { defaultValue: { statusName: 'Novo' } },
											data_cadastro: { editable: false, nullable: true, type: 'date' },
										},
									},
								},
								pageSize: 10,
								total: salesCount,
							});

							$('#sgiSales').kendoGrid({
								// autoBind: false,
								dataSource: dataSource,
								// height: 400,
								editable: true,
								scrollable: true,
								sortable: true,
								filterable: false,
								pageable: {
									input: true,
									numeric: false,
								},
								columns: [
									{
										field: 'data_cadastro',
										title: 'Data',
										template: `#= moment(new Date(data_cadastro)).format('L') #`,
										width: 120,
									},
									{
										field: 'numdoc',
										title: 'Nº Pedido',
										width: 120,
									},
									{
										field: 'cliente',
										title: 'Cliente',
										width: 250,
									},
									{
										field: 'valor_total_nota',
										title: 'Valor',
										format: '{0:c}',
										width: 130,
									},
									{
										field: 'numero_nfe',
										title: 'NF-e',
										width: 80,
									},
									{
										field: 'codigo_rastreamento',
										title: 'Rastreamento',
										width: 230,
									},
									{
										field: 'motivo_cancelado',
										title: 'Cancelado',
										width: 250,
									},
									{
										field: 'statuspedidoweb',
										title: 'Status',
										editor: statusDropDownEditor,
										template: '#= statuspedidoweb #',
										width: 150,
									},
								],
							});
						} else {
							// console.log('Finished');
							$('#sgiSales').html('Não há registro de vendas');
							resolve('success');
						}
					})
					.catch((err) => {
						console.log(err);
						reject(err);
					});
			})
			.catch((err) => {
				console.log(err);
				reject(err);
			});
	});

	// console.log(result);

	return result;
};

const getOrucTodaysSalesData = async () => {
	await instance
		.get(`/v1/pedidos?status=${status}&dataInicial=${moment(new Date()).format('YYYY-MM-DD')}&dataFinal=${moment(new Date()).format('YYYY-MM-DD')}`)
		.then((response) => {
			// console.log(response.data);

			if (response.data) {
				let sales = response.data.pedidos;
				// console.log(sales);

				todaySales = 0;

				sales.forEach((sale) => {
					todaySales = todaySales + parseFloat(sale.valor_total);
				});

				$('#todaySales').html(todaySales.toFixed(2).replace('.', ','));
				$('#todaySalesDate').html(`${sales.length} vendas(s)`);

				getOrucWeekSalesData();
			}
		})
		.catch(function (error) {
			// handle error
			console.log(error);
		});
};

const getOrucWeekSalesData = async () => {
	await instance
		.get(
			`/v1/pedidos?status=${status}&dataInicial=${moment().startOf('week').format('YYYY-MM-DD')}&dataFinal=${moment().endOf('week').format('YYYY-MM-DD')}`
		)
		.then((response) => {
			// console.log(response.data);

			if (response.data) {
				let sales = response.data.pedidos;
				// console.log(sales);

				totalWeekSales = 0;

				sales.forEach((sale) => {
					totalWeekSales = totalWeekSales + parseFloat(sale.valor_total);
				});

				$('#totalWeekSales').html(totalWeekSales.toFixed(2).replace('.', ','));
				$('#totalWeekSalesDate').html(`${sales.length} venda(s)`);

				getOrucMonthSalesData();
			}
		})
		.catch(function (error) {
			// handle error
			console.log(error);
		});
};

const getOrucMonthSalesData = async () => {
	await instance
		.get(
			`/v1/pedidos?status=${status}&dataInicial=${moment().startOf('month').format('YYYY-MM-DD')}&dataFinal=${moment()
				.endOf('month')
				.format('YYYY-MM-DD')}`
		)
		.then((response) => {
			// console.log(response.data);

			if (response.data) {
				let sales = response.data.pedidos;
				// console.log(sales);

				totalMonthSales = 0;

				sales.forEach((sale) => {
					totalMonthSales = totalMonthSales + parseFloat(sale.valor_total);
				});

				$('#totalMonthSales').html(totalMonthSales.toFixed(2).replace('.', ','));
				$('#totalMonthSalesDate').html(`${sales.length} venda(s)`);

				getOrucYearSalesData();
			}
		})
		.catch(function (error) {
			// handle error
			console.log(error);
		});
};

const getOrucYearSalesData = async () => {
	await instance
		.get(
			`/v1/pedidos?status=${status}&dataInicial=${moment().startOf('year').format('YYYY-MM-DD')}&dataFinal=${moment().endOf('year').format('YYYY-MM-DD')}`
		)
		.then((response) => {
			// console.log(response.data);

			if (response.data) {
				let sales = response.data.pedidos;
				// console.log(sales);

				totalYearSales = 0;

				sales.forEach((sale) => {
					totalYearSales = totalYearSales + parseFloat(sale.valor_total);
				});

				$('#totalYearSales').html(totalYearSales.toFixed(2).replace('.', ','));
				$('#totalYearSalesDate').html(`${sales.length} venda(s)`);
			}
		})
		.catch(function (error) {
			// handle error
			console.log(error);
		});
};

function statusDropDownEditor(container, options) {
	$('<input required name="' + options.field + '"/>')
		.appendTo(container)
		.kendoDropDownList({
			// autoBind: false,
			dataTextField: 'statusName',
			dataValueField: 'statusName',
			dataSource: {
				data: [
					{ statusId: 'novo', statusName: 'Novo' },
					{ statusId: 'pago', statusName: 'Pago' },
					{ statusId: 'separacao', statusName: 'Separacao' },
					{ statusId: 'entregue', statusName: 'Enviado' },
					{ statusId: 'concluido', statusName: 'Concluido' },
					{ statusId: 'cancelado', statusName: 'Cancelado' },
				],
			},
			change: function async(e) {
				let value = this.value();
				console.log(options.model.numdoc, value);
				updateOrucSaleStatus(options.model, value);
				// Use the value of the widget
			},
		});
}

const updateOrucSaleStatus = async (sale, value) => {
	const saleData = [
		{
			nf_chave: sale.nfe_chavedeacesso,
			nf_numero: sale.numero_nfe,
			nf_emissao: moment(new Date(sale.dataemi)).format('YYYY-MM-DD'),
			codigo_rastreamento: sale.codigo_rastreamento,
			motivo: sale.motivo_cancelado,
		},
	];

	await instance
		.put(`/api/v1/pedido/${sale.idpedido}/${value.toLowerCase()}`, saleData)
		.then((response) => {
			updateSGISaleStatus(sale, value);
		})
		.catch((err) => {
			console.log(err);
		});

	// let salePostOptions = {
	// 	hostname: 'www.meudatacenter.com',
	// 	port: 443,
	// 	path: `/api/v1/pedido/${sale.idpedido}/${value.toLowerCase()}`,
	// 	method: 'PUT',
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 		'Content-Length': saleData.length,
	// 		'x-ID': '3011',
	// 		'x-Token': '89s206193S553060S329961u6935s46j8919T79T7973j92s3615u32R9279S71O1942S74e1144s',
	// 	},
	// };

	// let req = https.request(salePostOptions, (res) => {
	// 	console.log(`statusCode: ${res.statusCode}`);
	// 	console.log(`statusMessage: ${res.statusMessage}`);

	// 	updateSGISaleStatus(sale, value);
	// });

	// req.on('error', (error) => {
	// 	console.log(error);
	// 	reject(error);
	// });

	// req.write(JSON.stringify(saleData));

	// req.end();
};

const updateSGISaleStatus = async (sale, value) => {
	const result = new Promise((resolve, reject) => {
		new sqlDb.ConnectionPool(db.config)
			.connect()
			.then((pool) => {
				pool.request()
					.query(`update saida_principal set statuspedidoweb = '${value}' where numdoc = '${sale.numdoc}'; `)
					.then((data) => {
						// log.info(`Sales: ${data.recordsets[0]}`);
						resolve('success');

						// let grid = $('#sgiSales').data('kendoGrid');
						// grid.refresh();
						// var dataItem = grid.dataSource.getByUid(sale.uid);
						// dataItem.dataItem.set('statuspedidoweb', `'${value}'`);
					})
					.catch((err) => {
						log.info(err);
						reject(err);
					});
			})
			.catch((err) => {
				log.info(err);
				reject(err);
			});
	});

	// log.info(result);

	return result;
};

function openPanelWindow() {
	ipcRenderer.send('panel', 'an-argument');
}

function openOrdersWindow() {
	ipcRenderer.send('orders', 'an-argument');
}
