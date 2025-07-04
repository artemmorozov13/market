document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createStoreForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Сброс сообщений об ошибках
        resetErrorMessages();
        document.getElementById('successMessage').style.display = 'none';
        
        // Валидация полей
        const email = document.getElementById('userEmail').value.trim();
        const name = document.getElementById('storeName').value.trim();
        const description = document.getElementById('storeDescription').value.trim();
        
        let isValid = true;
        
        if (!email || !validateEmail(email)) {
            document.getElementById('emailError').style.display = 'block';
            isValid = false;
        }
        
        if (!name) {
            document.getElementById('nameError').style.display = 'block';
            isValid = false;
        }
        
        if (!description) {
            document.getElementById('descriptionError').style.display = 'block';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Подготовка данных для отправки
        const storeData = {
            userEmail: email,
            name: name,
            description: description
        };
        
        try {
            // Здесь замените URL на ваш реальный API endpoint
            const response = await fetch('/api/store/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(storeData)
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Успешный ответ:', result);
            
            // Показываем сообщение об успехе
            document.getElementById('successMessage').style.display = 'block';
            
            // Очищаем форму
            form.reset();
            
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            alert('Произошла ошибка при создании магазина. Пожалуйста, попробуйте позже.');
        }
    });
    
    function resetErrorMessages() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => {
            msg.style.display = 'none';
        });
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});