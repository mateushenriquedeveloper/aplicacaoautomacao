window.addEventListener("message", function(event) {
       if (event.data.type === "FILL_DESBRAVADOR_FORM") {
         const data = event.data.data;
         
         document.querySelector('[name="nome"]').value = data.nome;
         document.querySelector('[name="cpf"]').value = data.cpf;
         document.querySelector('[name="dataNascimento"]').value = data.dataNascimento;
         document.querySelector('[name="telefone"]').value = data.telefone;
         document.querySelector('[name="cep"]').value = data.cep;
         document.querySelector('[name="endereco"]').value = data.endereco;
         document.querySelector('[name="bairro"]').value = data.bairro;
         document.querySelector('[name="cidade"]').value = data.cidade;
         document.querySelector('[name="numero"]').value = data.numero;
         document.querySelector('[name="email"]').value = data.email;
       }
     });