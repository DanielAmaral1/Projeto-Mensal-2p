document.getElementById('enviar').addEventListener('click', async function () {
    // Pega o valor dos campos de email e senha
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    // Verifica se os campos estão preenchidos
    if (!email || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Simulação de envio para um servidor
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
        });

        const result = await response.json();

        // Simulação de login bem-sucedido ou falha
        if (result.success) {
            alert('Login bem-sucedido!');
            // Redireciona para outra página após o login
            window.location.href = '/dashboard';
        } else {
            alert('E-mail ou senha inválidos!');
        }
    } catch (error) {
        console.error('Erro ao tentar login:', error);
        alert('Erro ao tentar login. Tente novamente mais tarde.');
    }
});
