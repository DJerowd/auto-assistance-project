const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function seedDatabase() {
  console.log("🌱 Iniciando a injeção de dados (Seeding)...");

  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "auto_assistance",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    // Desativar verificações de chaves estrangeiras temporariamente
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");

    console.log("🧹 Limpando as tabelas antigas...");
    await pool.query("TRUNCATE TABLE messages");
    await pool.query("TRUNCATE TABLE friendships");
    await pool.query("TRUNCATE TABLE reminders");
    await pool.query("TRUNCATE TABLE maintenances");
    await pool.query("TRUNCATE TABLE vehicle_images");
    await pool.query("TRUNCATE TABLE vehicles");
    await pool.query("TRUNCATE TABLE users");
    await pool.query('TRUNCATE TABLE brands');
    await pool.query('TRUNCATE TABLE colors');
    await pool.query('TRUNCATE TABLE features');
    await pool.query('TRUNCATE TABLE service_types');

    console.log('🏷️ Injetando as 67 Marcas (Brands)...');
    await pool.query(`
      INSERT INTO brands (id, name, logo_path) VALUES 
      (1, 'Abarth', 'public/seed_images/brands/abarth.webp'),
      (2, 'Acura', 'public/seed_images/brands/acura.webp'),
      (3, 'Alfa Romeo', 'public/seed_images/brands/alfa-romeo.webp'),
      (4, 'Aston Martin', 'public/seed_images/brands/aston-martin.webp'),
      (5, 'Audi', 'public/seed_images/brands/audi.webp'),
      (6, 'Bentley', 'public/seed_images/brands/bentley.webp'),
      (7, 'BMW', 'public/seed_images/brands/bmw.webp'),
      (8, 'Bugatti', 'public/seed_images/brands/bugatti.webp'),
      (9, 'Buick', 'public/seed_images/brands/buick.webp'),
      (10, 'BYD', 'public/seed_images/brands/byd.webp'),
      (11, 'Cadillac', 'public/seed_images/brands/cadillac.webp'),
      (12, 'Chery', 'public/seed_images/brands/chery.webp'),
      (13, 'Chevrolet', 'public/seed_images/brands/chevrolet.webp'),
      (14, 'Chrysler', 'public/seed_images/brands/chrysler.webp'),
      (15, 'Citroën', 'public/seed_images/brands/citroen.webp'),
      (16, 'DeLorean', 'public/seed_images/brands/delorean.webp'),
      (17, 'Dodge', 'public/seed_images/brands/dodge.webp'),
      (18, 'Ferrari', 'public/seed_images/brands/ferrari.webp'),
      (19, 'Fiat', 'public/seed_images/brands/fiat.webp'),
      (20, 'Ford', 'public/seed_images/brands/ford.webp'),
      (21, 'General Motors Company', 'public/seed_images/brands/general-motors-company.webp'),
      (22, 'Haval', 'public/seed_images/brands/haval.webp'),
      (23, 'Honda', 'public/seed_images/brands/honda.webp'),
      (24, 'Hummer', 'public/seed_images/brands/hummer.webp'),
      (25, 'Hyundai', 'public/seed_images/brands/hyundai.webp'),
      (26, 'Infiniti', 'public/seed_images/brands/infiniti.webp'),
      (27, 'Iveco', 'public/seed_images/brands/iveco.webp'),
      (28, 'JAC', 'public/seed_images/brands/jac.webp'),
      (29, 'Jaguar', 'public/seed_images/brands/jaguar.webp'),
      (30, 'Jeep', 'public/seed_images/brands/jeep.webp'),
      (31, 'Kia', 'public/seed_images/brands/kia.webp'),
      (32, 'Koenigsegg', 'public/seed_images/brands/koenigsegg.webp'),
      (33, 'Lada', 'public/seed_images/brands/lada.webp'),
      (34, 'Lamborghini', 'public/seed_images/brands/lamborghini.webp'),
      (35, 'Lancia', 'public/seed_images/brands/lancia.webp'),
      (36, 'Land Rover', 'public/seed_images/brands/land-rover.webp'),
      (37, 'Lexus', 'public/seed_images/brands/lexus.webp'),
      (38, 'Lincoln', 'public/seed_images/brands/lincoln.webp'),
      (39, 'Lotus', 'public/seed_images/brands/lotus.webp'),
      (40, 'Maserati', 'public/seed_images/brands/maserati.webp'),
      (41, 'Mazda', 'public/seed_images/brands/mazda.webp'),
      (42, 'McLaren', 'public/seed_images/brands/mclaren.webp'),
      (43, 'Mercedes-Benz', 'public/seed_images/brands/mercedes-benz.webp'),
      (44, 'Mercury', 'public/seed_images/brands/mercury.webp'),
      (45, 'Mini', 'public/seed_images/brands/mini.webp'),
      (46, 'Mitsubishi', 'public/seed_images/brands/mitsubishi.webp'),
      (47, 'Nissan', 'public/seed_images/brands/nissan.webp'),
      (48, 'Oldsmobile', 'public/seed_images/brands/oldsmobile.webp'),
      (49, 'Opel', 'public/seed_images/brands/opel.webp'),
      (50, 'Pagani', 'public/seed_images/brands/pagani.webp'),
      (51, 'Peugeot', 'public/seed_images/brands/peugeot.webp'),
      (52, 'Plymouth', 'public/seed_images/brands/plymouth.webp'),
      (53, 'Pontiac', 'public/seed_images/brands/pontiac.webp'),
      (54, 'Porsche', 'public/seed_images/brands/porsche.webp'),
      (55, 'RAM', 'public/seed_images/brands/ram.webp'),
      (56, 'Renault', 'public/seed_images/brands/renault.webp'),
      (57, 'Rolls-Royce', 'public/seed_images/brands/rolls-royce.webp'),
      (58, 'Saleen', 'public/seed_images/brands/saleen.webp'),
      (59, 'SEAT', 'public/seed_images/brands/seat.webp'),
      (60, 'Shelby', 'public/seed_images/brands/shelby.webp'),
      (61, 'Skoda', 'public/seed_images/brands/skoda.webp'),
      (62, 'Subaru', 'public/seed_images/brands/subaru.webp'),
      (63, 'Tesla', 'public/seed_images/brands/tesla.webp'),
      (64, 'Toyota', 'public/seed_images/brands/toyota.webp'),
      (65, 'Vauxhall', 'public/seed_images/brands/vauxhall.webp'),
      (66, 'Volkswagen', 'public/seed_images/brands/volkswagen.webp'),
      (67, 'Volvo', 'public/seed_images/brands/volvo.webp')
      `);
    
    console.log("🎨 Injetando Cores (Colors)...");
    await pool.query(`
      INSERT INTO colors (id, name, hex) VALUES 
      (1, 'Amarela', '#FFD700'),
      (2, 'Azul', '#003399'),
      (3, 'Bege', '#D1C0A8'),
      (4, 'Branca', '#F8F9FA'),
      (5, 'Cinza', '#708090'),
      (6, 'Dourada', '#B8860B'),
      (7, 'Grená', '#800000'),
      (8, 'Laranja', '#FF6600'),
      (9, 'Marrom', '#5C4033'),
      (10, 'Prata', '#C0C0C0'),
      (11, 'Preta', '#111111'),
      (12, 'Rosa', '#FF69B4'),
      (13, 'Roxa', '#4B0082'),
      (14, 'Verde', '#006400'),
      (15, 'Vermelha', '#CC0000'),
      (16, 'Fantasia', 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)')
    `);

    console.log("⚙️ Injetando Tipos de Serviço (Service Types)...");
    await pool.query(`
      INSERT INTO service_types (id, name) VALUES 
      (1, 'Outros'),
      (2, 'Alinhamento e Balanceamento'),
      (3, 'Elétrica'),
      (4, 'Estética e Polimento'),
      (5, 'Funilaria e Pintura'),
      (6, 'Modificação de Performance (Tuning)'),
      (7, 'Revisão Geral'),
      (8, 'Sistema de Freios'),
      (9, 'Suspensão e Amortecedores'),
      (10, 'Troca de Óleo e Filtros'),
      (11, 'Troca de Pneus'),
      (12, 'Swap de motor')
    `);

    console.log("✨ Injetando Acessórios e Opcionais (Features)...");
    await pool.query(`
      INSERT INTO features (id, name) VALUES 
      (1, 'Airbag'),
      (2, 'Alarme'),
      (3, 'Ar Condicionado'),
      (4, 'Ar quente'),
      (5, 'Assistente de Estacionamento'),
      (6, 'Bancos em Couro'),
      (7, 'Bancos dianteiros com aquecimento'),
      (8, 'CD Player'),
      (9, 'Central Multimídia'),
      (10, 'Computador de bordo'),
      (11, 'Controle automático de velocidade'),
      (12, 'Controle de Tração'),
      (13, 'Câmera de Ré'),
      (14, 'Desembaçador traseiro'),
      (15, 'Direção Elétrica'),
      (16, 'Direção Hidráulica'),
      (17, 'Direção Hidráulica/Elétrica'),
      (18, 'Encosto de cabeça traseiro'),
      (19, 'Farol de xenônio'),
      (20, 'Freio ABS'),
      (21, 'Freios Combinados'),
      (22, 'GPS'),
      (23, 'Motor supercharger '),
      (24, 'Motor turbo'),
      (25, 'Piloto Automático'),
      (26, 'Retrovisor fotocrômico'),
      (27, 'Retrovisor com rebatimento automático'),
      (28, 'Retrovisores elétricos'),
      (29, 'Rodas de Liga Leve'),
      (30, 'Rádio'),
      (31, 'Sensor de chuva'),
      (32, 'Sensor de estacionamento'),
      (33, 'Sensor de Ré'),
      (34, 'Som'),
      (35, 'Teto Solar'),
      (36, 'Tração Integral (AWD)'),
      (37, 'Trava Elétrica'),
      (38, 'Vidro Elétrico'),
      (39, 'Volante com regulagem de altura')
    `);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash("Senha123", salt);

    console.log("👤 Criando perfis dos usuários...");
    await pool.query(
      `
      INSERT INTO users (id, name, email, password, role, profile_image) VALUES
      (1, 'Administrador', 'admin@gmail.com', '${hashPassword}', 'ADMIN', 'public/seed_images/profiles/admin.png'),
      (2, 'Chip Foose', 'chip@foosedesign.com', '${hashPassword}', 'USER', 'public/seed_images/profiles/foose.webp'),
      (3, 'Brian O''Conner', 'brian@buster.com', '${hashPassword}', 'USER', 'public/seed_images/profiles/brian.webp'),
      (4, 'Ken Block', 'ken@hoonigan.com', '${hashPassword}', 'USER', 'public/seed_images/profiles/ken.webp'),
      (5, 'Smokey Nagata', 'smokey@topsecret.jp', '${hashPassword}', 'USER', 'public/seed_images/profiles/smokey.webp'),
      (6, 'Dominic Toretto', 'dom@familia.com', '${hashPassword}', 'USER', 'public/seed_images/profiles/dom.webp'),
      (7, 'Rubens Barrichello', 'rubinho@111.com.br', '${hashPassword}', 'USER', 'public/seed_images/profiles/rubinho.webp'),
      (8, 'Ricardinho ACF', 'ricardo@acf.com.br', '${hashPassword}', 'USER', 'public/seed_images/profiles/ricardinho.jpeg'),
      (9, 'Richard Rawlings', 'richard@gasmonkey.com', '${hashPassword}', 'USER', 'public/seed_images/profiles/richard.webp'),
      (10, 'Aaron Kaufman', 'aaron@arclight.com', '${hashPassword}', 'USER', 'public/seed_images/profiles/aaron.webp')
    `);

    console.log("🚗 Criando veículos...");
    await pool.query(`
      INSERT INTO vehicles (
        id, user_id, brand_id, color_id, license_plate, model, version, year_of_manufacture, year_model, current_mileage, nickname, share_with_friends
      ) VALUES 
      (1, 1, 23, 10, 'ABC-1234', 'Civic', 'Touring 1.5 Turbo', 2021, 2021, 45000, 'Carro do Administrador', TRUE),
      (2, 1, 54, 10, 'GT3-9912', '911', 'GT3 RS (991.2)', 2019, 2019, 12000, 'Brinquedo de Pista', TRUE),
      (3, 2, 20, 15, 'OVR-2004', 'F-100', 'Foose Custom', 1956, 1956, 1500, 'F-100 Overhaulin', FALSE),
      (4, 3, 47, 2, '2J4-7Z98', 'Skyline GT-R', 'R34 V-Spec II', 1999, 1999, 35000, 'Godzilla (Brian)', TRUE),
      (5, 3, 46, 14, 'ECL-1995', 'Eclipse', 'GSX', 1995, 1995, 75000, 'Eclipse Verde (Brian)', TRUE),
      (6, 4, 20, 11, 'HOO-1965', 'Mustang', 'Hoonicorn V2', 1965, 1965, 5000, 'Hoonicorn (Ken)', TRUE),
      (7, 5, 64, 6, 'V12-0400', 'Supra', 'Top Secret V12', 1998, 1998, 120000, 'V12 Supra (Smokey)', TRUE),
      (8, 6, 17, 11, 'DOM-1970', 'Charger', 'R/T Blower', 1970, 1970, 45000, 'O Monstro de 9 Segundos', TRUE),
      (9, 7, 13, 4, 'RUB-0111', 'Cruze', 'Stock Car V8', 2022, 2022, 2500, 'Carro 111 (Full Time)', TRUE),
      (10, 8, 66, 2, 'ACF-1000', 'Gol', 'GTi Forjado Turbo', 1993, 1993, 150000, 'Golzera Canhão', TRUE),
      (11, 9, 60, 141, 'GAS-M0NK', 'Mustang', 'Fastback Gas Monkey', 1968, 1968, 12000, 'Mustang Black', TRUE),
      (12, 10, 20, 4, 'ARC-P1K3', 'F-100', 'Pikes Peak Edition', 1963, 1963, 2000, 'A F-100 de Corrida', TRUE),
      (13, 3, 64, 8, '10S-CAR', 'Supra', 'MKIV RZ Twin Turbo', 1994, 1994, 15000, 'O Carro de 10 Segundos', TRUE)
    `);

    console.log("📸 Anexando fotos na galeria dos veículos...");
    await pool.query(`
      INSERT INTO vehicle_images (vehicle_id, image_path, is_primary) VALUES 
      (1, 'public/seed_images/vehicles/civic1.webp', TRUE),
      (1, 'public/seed_images/vehicles/civic2.webp', FALSE),
      (1, 'public/seed_images/vehicles/civic3.webp', FALSE),
      (1, 'public/seed_images/vehicles/civic4.webp', FALSE),
      (1, 'public/seed_images/vehicles/civic5.webp', FALSE),
      (1, 'public/seed_images/vehicles/civic6.webp', FALSE),
      (1, 'public/seed_images/vehicles/civic7.webp', FALSE),
      (2, 'public/seed_images/vehicles/911porsche1.jpg', TRUE),
      (3, 'public/seed_images/vehicles/foosef100.jpeg', TRUE),
      (4, 'public/seed_images/vehicles/brianskyline1.webp', TRUE),
      (4, 'public/seed_images/vehicles/brianskyline2.webp', FALSE),
      (5, 'public/seed_images/vehicles/brianeclipse.jpg', TRUE),
      (6, 'public/seed_images/vehicles/hoonicorn.jpg', TRUE),
      (7, 'public/seed_images/vehicles/v12supra1.jpg', TRUE),
      (7, 'public/seed_images/vehicles/v12supra2.jpg', FALSE),
      (7, 'public/seed_images/vehicles/v12supra3.jpg', FALSE),
      (7, 'public/seed_images/vehicles/v12supra4.jpg', FALSE),
      (7, 'public/seed_images/vehicles/v12supra5.jpg', FALSE),
      (7, 'public/seed_images/vehicles/v12supra6.jpg', FALSE),
      (8, 'public/seed_images/vehicles/domcharger.jpg', TRUE),
      (9, 'public/seed_images/vehicles/stockcarcruze.jpg', TRUE),
      (10, 'public/seed_images/vehicles/acfgolgti.jpeg', TRUE),
      (11, 'public/seed_images/vehicles/gasmonkeymustang.jpg', TRUE),
      (12, 'public/seed_images/vehicles/aaronf100pikes.jpg', TRUE),
      (13, 'public/seed_images/vehicles/briansupra.jpg', TRUE)
    `);

    console.log("🔧 Gerando histórico de manutenções e modificações...");
    await pool.query(`
      INSERT INTO maintenances (
        id, vehicle_id, service_type, maintenance_date, mileage, cost, service_provider, notes
      ) VALUES 
      (1, 1, 7, '2025-10-15', 40000, 850.00, 'Oficina Autorizada', 'Troca de óleo, filtros, fluido de freio e alinhamento'),
      (2, 1, 4, '2026-05-20', 34000, 850.00, 'Detailer Pro', 'Polimento técnico, vitrificação de pintura e higienização interna'),
      (3, 1, 11, '2025-11-05', 40000, 3200.00, 'Borracharia Michelin', '4 Pneus Michelin Primacy 4 novos'),
      (4, 1, 8, '2026-03-15', 45000, 650.00, 'Oficina Confiança', 'Troca de pastilhas de freio dianteiras e traseiras (Cerâmica)'),
      (5, 1, 10, '2026-07-01', 48000, 450.00, 'Honda Imperial', 'Troca de óleo Motul 8100 e filtro original'),
      (6, 2, 6, '2026-08-10', 10000, 15000.00, 'Stuttgart RS', 'Instalação de escape completo Akrapovic em Titânio'),
      (7, 2, 8, '2026-01-20', 11500, 8000.00, 'Stuttgart RS', 'Troca do fluido de freio para racing Castrol SRF e pastilhas Pagid Yellow para o Track Day'),
      (8, 4, 6, '2003-06-05', 30000, 5000.00, 'Oficina do Harry', 'Instalação de sistema de Óxido Nitroso duplo. Coloca na conta do Harry.'),
      (9, 6, 6, '2016-10-10', 4500, 50000.00, 'Hoonigan Racing', 'Conversão pra Twin Turbo rodando no Metanol. Bateu 1400cv no dino!'),
      (10, 7, 12, '2007-04-12', 115000, 75000.00, 'Top Secret Performance', 'Arranquei o 2JZ, coloquei um V12 1GZ-FE biturbo. Foco nos 400 km/h.'),
      (11, 8, 3, '2020-04-12', 44000, 3000.00, 'Oficina Toretto', 'Reconstrução do Blower (Supercharger). A família ajudou a montar.'),
      (12, 10, 6, '2025-09-01', 148000, 18500.00, 'Alta RPM / ACF', 'Forjamos o motor AP! Pistão, biela, e turbina Holset HX35. Rendeu 450cv de roda.'),
      (13, 11, 9, '2025-11-15', 11000, 25000.00, 'Gas Monkey Garage', 'Colocamos uma suspensão a ar RideTech e freios Wilwood GIGANTES!'),
      (14, 13, 6, '2001-06-22', 14500, 15000.00, 'Oficina Toretto', 'Peças enviadas do Japão durante a noite. Restauração completa do 2JZ-GTE com turbina T66.')
    `);

    console.log("⏰ Agendando lembretes...");
    await pool.query(`
      INSERT INTO reminders (
        vehicle_id, service_type, mileage_threshold, date_threshold, notes
      ) VALUES 
      (1, 'Renovação de Seguro', NULL, '2027-01-15', 'O seguro da Porto Seguro vence no meio de janeiro. Ligar para corretora.'),
      (1, 'Pagar IPVA 2027', NULL, '2027-01-25', 'Pagar a cota única com desconto no Detran/PR.'),
      (1, 'Revisão de 50.000 KM', 50000, NULL, 'Revisão pesada. Trocar óleo do câmbio CVT e velas de ignição.'),
      (2, 'Track Day Interlagos', NULL, '2026-11-20', 'Pagar a inscrição do Porsche Club. Revisar pressão dos pneus Michelin Cup 2.'),
      (4, 'Comprar Nitro', NULL, '2026-08-10', 'Precisamos de mais duas garrafas cheias para o evento da Race Wars.'),
      (8, 'Alinhamento', 45500, NULL, 'Alinhar depois de empinar nas rodas traseiras no sinal vermelho.'),
      (10, 'Troca de Óleo', 151000, NULL, 'Trocar óleo Motul 300V. Motor forjado suja óleo rápido, não esquecer!')
    `);

    console.log("🤝 Conectando amigos...");
    await pool.query(`
      INSERT INTO friendships (requester_id, addressee_id, status) VALUES 
      (1, 2, 'ACCEPTED'), -- Administrador / Chip Foose
      (1, 3, 'ACCEPTED'), -- Administrador / Brian
      (1, 4, 'ACCEPTED'), -- Administrador / Ken Block
      (1, 6, 'ACCEPTED'), -- Administrador / Dom Toretto
      (1, 7, 'ACCEPTED'), -- Administrador / Rubinho
      (1, 8, 'ACCEPTED'), -- Administrador / Ricardinho ACF
      (1, 9, 'ACCEPTED'), -- Administrador / Richard Rawlings
      (1, 10, 'ACCEPTED'), -- Administrador / Aaron
      (3, 6, 'ACCEPTED'), -- Brian e Dom
      (5, 1, 'PENDING')   -- Smokey Nagata / Administrador
    `);

    console.log("💬 Gerando as conversas no chat...");
    await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content, attachment_type, attachment_id, is_read, created_at) VALUES 
      (6, 1, 'Não importa o que você dirige, o que importa é a família.', NULL, NULL, TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
      (6, 1, 'Veja o meu veículo: Charger R/T Blower', 'VEHICLE', 8, TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
      (1, 6, 'Respeito total, Dom. Esse Charger é intimidador demais.', NULL, NULL, TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY)),

      (7, 1, 'E aí bicho! Vai colar no autódromo de Interlagos no próximo domingo?', NULL, NULL, TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
      (1, 7, 'Com certeza! Vou levar o Porsche pra acelerar no Track Day.', NULL, NULL, TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
      (7, 1, 'Top! Depois passa nos boxes da Full Time, o Cruze número 111 tá afinado.', NULL, NULL, FALSE, NOW()),

      (8, 1, 'Mano do céu, você não vai acreditar. Moí o câmbio do Golzera de novo kkkk', NULL, NULL, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
      (1, 8, 'Cara, você não perdoa uma marcha! Vai colocar um câmbio forjado de engate rápido agora?', NULL, NULL, FALSE, NOW()),

      (9, 1, 'Get you some of that! Achamos uma picape abandonada no Texas, quer comprar?', NULL, NULL, FALSE, NOW()),
      (10, 1, 'O Richard tá louco, ela tá só a ferrugem. Mas eu dou um jeito se quiser.', NULL, NULL, FALSE, NOW()),
      
      (2, 1, 'Fala garoto! Aquele projeto de pintura Two-Tone no Civic sai ou não sai?', NULL, NULL, TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY)),
      (1, 2, 'Fala Mestre Foose! Tô juntando uma grana, logo encosto a nave aí na oficina.', NULL, NULL, TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY)),

      (3, 1, 'Veja o meu veículo: Skyline GT-R R34 V-Spec II', 'VEHICLE', 3, TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
      (1, 3, 'Animal demais! Esse RB26DETT tá rodando liso?', NULL, NULL, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
      (3, 1, 'Tá perfeito, acerto fino. Quase pronto pra corrida de sexta.', NULL, NULL, FALSE, NOW()),
      
      (4, 1, 'Fala chefe! Separa um jogo de pneu aí que o Hoonicorn tá precisando derreter borracha no Gymkhana!', NULL, NULL, FALSE, NOW()),

      (3, 6, 'Eu disse que te devia um carro de 10 segundos.', NULL, NULL, FALSE, NOW()),
      (3, 6, 'Veja o meu veículo: Supra MKIV RZ Twin Turbo', 'VEHICLE', 13, FALSE, NOW())
    `);

    // Reativar verificações das chaves estrangeiras
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("\n===========================================");
    console.log('🏁 BANCO DE DADOS ABSOLUTO PRONTO! 🏁');
    console.log('Faça login com: admin@gmail.com / admin123');
    console.log("===========================================\n");
  } catch (error) {
    console.error("❌ Erro ao popular o banco de dados:", error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

seedDatabase();
