/**
 * LSU École du Cap - JavaScript principal
 * Fonctionnalités communes et utilitaires
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialisation des tooltips Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialisation des popovers Bootstrap
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Auto-dismiss des alertes
    var alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    
    // Confirmation de suppression
    var deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
                e.preventDefault();
            }
        });
    });
    
    // Validation des formulaires
    var forms = document.querySelectorAll('.needs-validation');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
    
    // Prévisualisation d'image
    var imageInputs = document.querySelectorAll('.image-input');
    imageInputs.forEach(function(input) {
        input.addEventListener('change', function(e) {
            var file = e.target.files[0];
            var preview = document.getElementById(e.target.dataset.preview);
            
            if (file && preview) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    });
    
    // Recherche en temps réel
    var searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(function(input) {
        input.addEventListener('input', function(e) {
            var searchTerm = e.target.value.toLowerCase();
            var targetClass = e.target.dataset.target;
            var items = document.querySelectorAll('.' + targetClass);
            
            items.forEach(function(item) {
                var text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Tri des tableaux
    var sortableTables = document.querySelectorAll('.table-sortable');
    sortableTables.forEach(function(table) {
        var headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(function(header) {
            header.addEventListener('click', function() {
                var column = this.dataset.sort;
                var tbody = table.querySelector('tbody');
                var rows = Array.from(tbody.querySelectorAll('tr'));
                var isAscending = this.classList.contains('sort-asc');
                
                // Trier les lignes
                rows.sort(function(a, b) {
                    var aValue = a.querySelector('td[data-' + column + ']').dataset[column];
                    var bValue = b.querySelector('td[data-' + column + ']').dataset[column];
                    
                    if (isAscending) {
                        return aValue.localeCompare(bValue);
                    } else {
                        return bValue.localeCompare(aValue);
                    }
                });
                
                // Réorganiser le tableau
                rows.forEach(function(row) {
                    tbody.appendChild(row);
                });
                
                // Mettre à jour l'indicateur de tri
                headers.forEach(function(h) {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                this.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
            });
        });
    });
    
    // Notifications personnalisées
    window.showNotification = function(message, type = 'info', duration = 5000) {
        var notification = document.createElement('div');
        notification.className = 'alert alert-' + type + ' notification';
        notification.innerHTML = message;
        
        document.body.appendChild(notification);
        
        setTimeout(function() {
            notification.remove();
        }, duration);
    };
    
    // Formatage des dates
    window.formatDate = function(dateString) {
        var date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // Formatage des nombres
    window.formatNumber = function(number) {
        return new Intl.NumberFormat('fr-FR').format(number);
    };
    
    // Validation d'email
    window.validateEmail = function(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };
    
    // Validation de mot de passe
    window.validatePassword = function(password) {
        // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
        var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return re.test(password);
    };
    
    // Export en CSV
    window.exportToCSV = function(tableId, filename) {
        var table = document.getElementById(tableId);
        var csv = [];
        var rows = table.querySelectorAll('tr');
        
        rows.forEach(function(row) {
            var cols = row.querySelectorAll('td, th');
            var rowData = [];
            cols.forEach(function(col) {
                rowData.push('"' + col.textContent.replace(/"/g, '""') + '"');
            });
            csv.push(rowData.join(','));
        });
        
        var csvContent = csv.join('\n');
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        
        if (link.download !== undefined) {
            var url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    // Impression
    window.printElement = function(elementId) {
        var element = document.getElementById(elementId);
        var printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Impression</title>');
        printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(element.outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };
    
    // Gestion des thèmes
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            var currentTheme = document.body.getAttribute('data-theme');
            var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Mettre à jour l'icône
            var icon = this.querySelector('i');
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        });
        
        // Charger le thème sauvegardé
        var savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        var icon = themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Gestion des raccourcis clavier
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S pour sauvegarder
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            var saveButton = document.querySelector('.btn-save');
            if (saveButton) {
                saveButton.click();
            }
        }
        
        // Ctrl/Cmd + N pour nouveau
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            var newButton = document.querySelector('.btn-new');
            if (newButton) {
                newButton.click();
            }
        }
        
        // Échap pour fermer les modales
        if (e.key === 'Escape') {
            var modals = document.querySelectorAll('.modal.show');
            modals.forEach(function(modal) {
                var modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });
        }
    });
    
    // Gestion du mode hors ligne
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('Service Worker enregistré avec succès');
            })
            .catch(function(error) {
                console.log('Échec de l\'enregistrement du Service Worker');
            });
    }
    
    // Gestion de la visibilité de la page
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Page cachée
            document.title = 'LSU École du Cap - En arrière-plan';
        } else {
            // Page visible
            document.title = 'LSU École du Cap';
        }
    });
    
    // Animation d'apparition des éléments
    var observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    var animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(function(element) {
        observer.observe(element);
    });
    
    console.log('LSU École du Cap - JavaScript initialisé');
});

// Fonctions utilitaires globales
window.LSU = {
    // Afficher un loader
    showLoader: function() {
        var loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Chargement...</span></div>';
        document.body.appendChild(loader);
    },
    
    // Masquer le loader
    hideLoader: function() {
        var loader = document.querySelector('.loader-overlay');
        if (loader) {
            loader.remove();
        }
    },
    
    // Afficher une confirmation
    confirm: function(message, callback) {
        if (confirm(message)) {
            callback();
        }
    },
    
    // Afficher une alerte
    alert: function(message, type = 'info') {
        this.showNotification(message, type);
    }
}; 