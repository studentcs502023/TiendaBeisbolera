require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Producto = require('./models/Producto'); // Asegúrate de que la ruta a tu modelo sea correcta

// 1. Conectar a MongoDB
// 1. Conectar a MongoDB (limpio, sin opciones obsoletas)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tu_base_de_datos')
.then(() => {
  console.log('📦 Conectado a MongoDB para importación masiva');
  importarDatos();
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
});

async function importarDatos() {
  try {
    // 2. Leer el archivo Excel
    const workbook = XLSX.readFile('gorras.xlsx');
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`🚀 Se encontraron ${data.length} productos en el Excel. Importando...`);

    // 3. Procesar y guardar cada producto
    for (const item of data) {
      // El slug se generará automáticamente gracias al hook pre('save') que configuramos en tu modelo
      const nuevoProducto = new Producto({
        nombre: item.nombre,
        marca: item.marca,
        tipo: item.tipo,
        color: item.color,
        precio: Number(item.precio),
        stock: Number(item.stock) || 1,
        descripcion: item.descripcion || '',
        imagen_cloudinary_url: item.imagen_cloudinary_url,
        estado: 'activo'
      });

      await nuevoProducto.save();
      console.log(`✅ Importado: ${item.nombre}`);
    }

    console.log('🎉 ¡Todas las gorras fueron importadas con éxito a MongoDB!');
    process.exit();

  } catch (error) {
    console.error('❌ Error durante la importación masiva:', error);
    process.exit(1);
  }
}