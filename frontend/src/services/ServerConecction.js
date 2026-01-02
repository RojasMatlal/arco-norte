
'use strict';

const SERVERS = {
  CALPULALPAN: {
    id: 'CALPULALPAN',
    name: 'Calpulalpan',
    host: '192.168.12.100',
    port: 1433,
    dbType: 'SQLSERVER',
    database: 'TRANSITO',
    user: 'sa',
    password: '********',
  },

  SANCTORUM: {
    id: 'SANCTORUM',
    name: 'Sanctórum',
    host: '192.168.13.100',
    port: 1433,
    dbType: 'SQLSERVER',
    database: 'TRANSITO',
    user: 'sa',
    password: '********',
  },

  SAN_MARTIN_TEXMELUCAN: {
    id: 'SAN_MARTIN_TEXMELUCAN',
    name: 'San Martín Texmelucan',
    host: '192.168.14.100',
    port: 1433,
    dbType: 'SQLSERVER',
    database: 'TRANSITO',
    user: 'sa',
    password: '********',
  },
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function connectToServer(lugarId) {
  const server = SERVERS[lugarId];

  if (!server) {
    throw new Error(`Lugar no configurado: ${lugarId}`);
  }

//   aqui va el servidor de sql server o si gustas exponer los datos y consumirlos como servicio 
  await delay(800);

  return {
    success: true,
    message: 'Conexión simulada OK',
    server: {
      id: server.id,
      name: server.name,
      host: server.host,
      dbType: server.dbType,
    },
  };
}

async function getTransito({ lugarId, fecha, hora }) {
  await connectToServer(lugarId);

  return {
    success: true,
    data: [
      {
        placa: 'ABC-123',
        fecha,
        hora,
        camara: 'CAM-01',
        lugar: lugarId,
      },
    ],
  };
}

async function processOCR({ lugarId, imageBase64 }) {
  await connectToServer(lugarId);

 
  return {
    success: true,
    placaDetectada: 'XYZ-987',
    confianza: '95%',
  };
}

async function getByMatricula({ lugarId, placa }) {
  await connectToServer(lugarId);

  return {
    success: true,
    data: {
      placa,
      fecha: '2024-11-21',
      hora: '14:32',
      lugar: lugarId,
      camara: 'CAM-02',
    },
  };
}


async function getHistorial({ userId }) {

  await delay(500);

  return {
    success: true,
    data: [
      {
        tipo: 'MATRICULA',
        valor: 'ABC-123',
        fecha: '2024-11-20 12:01',
      },
    ],
  };
}

module.exports = {
  SERVERS,
  connectToServer,
  getTransito,
  processOCR,
  getByMatricula,
  getHistorial,
};