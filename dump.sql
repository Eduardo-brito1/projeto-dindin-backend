create table categorias (
    id serial primary key ,
    descricao text 
)

create table usuarios(
    id serial primary key,
    nome text not null,
    email text not null unique,
    senha text not null
)


create table transacoes(
    id serial primary key,
    descricao text ,
    valor integer  not null,
    data date not null default CURRENT_DATE ,
    categoria_id serial references categorias(id) ,
    usuario_id  serial references  usuarios(id),   
  	tipo text not null
)   



insert into categorias (descricao) 
values 
('alimentação'),
('Assinaturas e Serviços'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Família'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Saúde'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras receitas'),
('Outras despesas')