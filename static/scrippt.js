document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const API_ENDPOINT = '/api/register';
  
    // Password strength indicator
    passwordInput.addEventListener('input', function() {
      const password = passwordInput.value;
      const strength = calculatePasswordStrength(password);
      updateStrengthIndicator(strength);
    });
  
    // Form submission
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Validate form
      if (!validateForm()) {
        return;
      }
      
      // Prepare form data
      const formData = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: passwordInput.value
      };
      
      try {
        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Securing Access...';
        
        // Send registration request
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Registration successful
          showSuccessMessage('Access granted! Redirecting to authentication...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          // Show error from server
          showErrorMessage(data.message || 'Registration failed. Please try again.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Request Access';
        }
      } catch (error) {
        console.error('Registration error:', error);
        showErrorMessage('Network error. Please check your connection.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request Access';
      }
    });
  
    // Form validation
    function validateForm() {
      let isValid = true;
      
      // Clear previous errors
      document.querySelectorAll('.error-message').forEach(el => el.remove());
      
      // Check username
      const username = document.getElementById('username').value.trim();
      if (username.length < 4) {
        showError('username', 'Agent ID must be at least 4 characters');
        isValid = false;
      }
      
      // Check email
      const email = document.getElementById('email').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('email', 'Please enter a valid security clearance email');
        isValid = false;
      }
      
      // Check password
      const password = passwordInput.value;
      if (password.length < 8) {
        showError('password', 'Access code must be at least 8 characters');
        isValid = false;
      }
      
      // Check password match
      if (password !== confirmPasswordInput.value) {
        showError('confirmPassword', 'Access codes do not match');
        isValid = false;
      }
      
      // Check terms
      if (!document.getElementById('terms').checked) {
        showError('terms', 'You must agree to the terms');
        isValid = false;
      }
      
      return isValid;
    }
  
    // Helper functions
    function showError(fieldId, message) {
      const field = document.getElementById(fieldId);
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.textContent = message;
      
      // Insert after the input field
      field.parentNode.insertBefore(errorElement, field.nextSibling);
      
      // Highlight field
      field.style.borderColor = '#ff4444';
      field.addEventListener('input', function() {
        field.style.borderColor = '#16213e';
        errorElement.remove();
      }, { once: true });
    }
  
    function showErrorMessage(message) {
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.style.textAlign = 'center';
      errorElement.style.marginTop = '20px';
      errorElement.textContent = message;
      
      // Insert before the submit button
      registerForm.insertBefore(errorElement, registerForm.querySelector('button[type="submit"]'));
    }
  
    function showSuccessMessage(message) {
      const successElement = document.createElement('div');
      successElement.className = 'success-message';
      successElement.textContent = message;
      registerForm.appendChild(successElement);
      successElement.style.display = 'block';
    }
  
    function calculatePasswordStrength(password) {
      let strength = 0;
      
      // Length
      if (password.length > 10) strength += 1;
      if (password.length > 15) strength += 1;
      
      // Complexity
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      
      return Math.min(strength, 3);
    }
  
    function updateStrengthIndicator(strength) {
      strengthBars.forEach((bar, index) => {
        if (index < strength) {
          bar.style.backgroundColor = 
            strength === 1 ? '#ff4444' : 
            strength === 2 ? '#ffbb33' : '#00C851';
        } else {
          bar.style.backgroundColor = '#1a1a2e';
        }
      });
    }
  });