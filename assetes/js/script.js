document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pitchForm');
    const resetButton = form.querySelector('button[type="reset"]');
    const hiddenInput = document.getElementById('typeField');
    const optionsContainer = document.querySelector('.options');
    const suggestionOption = document.getElementById('suggestionOption');
    const suggestionContainer = document.getElementById('suggestionContainer');
    const suggestionInput = document.getElementById('suggestionInput');
    const addSuggestionButton = document.getElementById('addSuggestion');
    const rightPanel = document.querySelector('.right-panel');
    const loader = document.getElementById('loader'); // Loader element

    const errorMessages = {
        description: "Description is required.",
        customer: "Customer is required.",
        title: "Title is required.",
        type: "Please select an option."
    };

    let selectedOptions = [];

    // Handle option click
    optionsContainer.addEventListener('click', function(event) {
        if (event.target.closest('.option')) {
            const option = event.target.closest('.option');
            const value = option.getAttribute('data-value');

            if (option.id === 'suggestionOption') {
                // Show the suggestion input field
                suggestionContainer.style.display = 'block';
                suggestionInput.focus();
            } else {
                handleOptionClick(value, option);
            }
        }
    });

    // Handle adding a suggestion
    addSuggestionButton.addEventListener('click', function() {
        const newSuggestion = suggestionInput.value.trim();
        if (newSuggestion) {
            // Create a new option element for the suggestion
            const newOption = document.createElement('div');
            newOption.className = 'option';
            newOption.setAttribute('data-value', newSuggestion);
            newOption.innerHTML = `<span>${newSuggestion}</span>`;

            // Add click event to the new option
            newOption.addEventListener('click', function() {
                handleOptionClick(newSuggestion, this);
            });

            // Append the new option to the options list
            optionsContainer.insertBefore(newOption, suggestionOption);

            // Select the new suggestion
            handleOptionClick(newSuggestion, newOption);

            // Hide the suggestion input field
            suggestionContainer.style.display = 'none';
            suggestionInput.value = ''; // Clear the input field
        }
    });

    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting

        // Show the loader
        loader.style.display = 'block';

        // Get all form field values
        const description = document.getElementById('description').value.trim();
        const customer = document.getElementById('customer').value.trim();
        const title = document.getElementById('title').value.trim();
        const type = hiddenInput.value;

        // Clear previous error messages
        clearErrorMessages();

        // Validation
        let hasErrors = false;

        if (!description) {
            showError('description', errorMessages.description);
            hasErrors = true;
        }
        if (!customer) {
            showError('customer', errorMessages.customer);
            hasErrors = true;
        }
        if (!title) {
            showError('title', errorMessages.title);
            hasErrors = true;
        }
        if (!type) {
            showError('typeField', errorMessages.type);
            hasErrors = true;
        }

        if (!hasErrors) {
            // Call the new function to handle the form submission
            handleFormSubmission(description, customer, title, type);
        } else {
            // Hide the loader if there are errors
            loader.style.display = 'none';
        }
    });

    // Handle form reset
    resetButton.addEventListener('click', function(event) {
        // Clear the form fields
        form.reset();

        // Remove the 'selected' class from all options
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.remove('selected');
        });

        // Clear the hidden input field
        hiddenInput.value = '';

        // Hide the suggestion input field and clear its value
        suggestionContainer.style.display = 'none';
        suggestionInput.value = '';

        // Clear previous error messages
        clearErrorMessages();

        // Clear the content in the right panel
        rightPanel.innerHTML = '';

        // Reset the selected options array
        selectedOptions = [];
    });

    function handleOptionClick(optionValue, element) {
        // Check if the option is already selected
        if (selectedOptions.includes(optionValue)) {
            // If already selected, unselect it
            selectedOptions = selectedOptions.filter(value => value !== optionValue);
            element.classList.remove('selected');
        } else {
            // If not selected, check if the limit is exceeded
            if (selectedOptions.length >= 3) {
                alert('Only three options are allowed.');
                return;
            }
            // Add the new option to the list of selected options
            selectedOptions.push(optionValue);
            element.classList.add('selected');
        }

        // Update the hidden input field's value
        hiddenInput.value = selectedOptions.join(', ');
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            // Create or update the error message element
            let error = field.nextElementSibling;
            if (!error || !error.classList.contains('error-message')) {
                error = document.createElement('div');
                error.className = 'error-message';
                field.parentNode.insertBefore(error, field.nextSibling);
            }
            error.textContent = message;
        }
    }

    function clearErrorMessages() {
        const errors = document.querySelectorAll('.error-message');
        errors.forEach(error => {
            error.remove();
        });
    }

    function handleFormSubmission(description, customer, title, type) {
        const requestData = {
            "model": "gpt-4",
            "messages": [
                {
                    "role": "user",
                    "content": `Write a professional sales pitch for selling ${description} to ${customer}. The customer's post is ${title}. Please write a ${type} too.`
                }
            ],
            "max_tokens": 150
        };

        fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            // Hide the loader
            loader.style.display = 'none';

            // Display the API response content in the right panel
            if (data.choices && data.choices.length > 0) {
                rightPanel.innerHTML = `
                    <div>${data.choices[0].message.content.replace(/\n/g, '<br>')}</div>
                    <button id="copyButton"><img src="../image/copy.png" /></button>
                `;
                
                // Add copy functionality to the new button
                document.getElementById('copyButton').addEventListener('click', function() {
                    const range = document.createRange();
                    range.selectNodeContents(rightPanel.querySelector('div'));
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);

                    try {
                        document.execCommand('copy');
                        alert('Content copied to clipboard!');
                    } catch (err) {
                        console.error('Failed to copy:', err);
                    }
                    selection.removeAllRanges();
                });
            }
        })
        .catch(error => {
            console.error("Error:", error);
            // Hide the loader in case of an error
            loader.style.display = 'none';
            // Handle errors here
        });
    }
});
