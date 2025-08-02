// Enhanced Daily Report Application with All Requested Features

class DailyReportApp {
    constructor() {
        // Core data
        this.authorizedEmails = ["dhemanth369@gmail.com"];
        this.currentUser = null;
        this.isAuthorized = false;
        this.currentEditCell = null;
        this.editModeEnabled = false;
        this.reports = this.loadReports();
        this.csvBlob = null;
        this.csvFileName = '';
        
        // Password system - default password is 'admin123'
        this.adminPasswordHash = 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg='; // SHA-256 of 'admin123'
        
        // Suggestions for autocomplete
        this.suggestions = {
            crtFaculty: [],
            collegeFaculty: [],
            whichClass: [],
            practiceFaculty: [],
            nonCrtClass: [],
            nonCrtFaculty: []
        };
        
        // Load saved data
        this.loadAuthorizedEmails();
        this.loadSuggestions();
        this.loadAdminPassword();
        
        // Initialize app
        this.initializeApp();
    }

    initializeApp() {
        setTimeout(() => {
            this.setupEventListeners();
            this.setDefaultDate();
            this.loadCurrentReport();
            this.updateUI();
            console.log('Daily Report App initialized successfully');
        }, 100);
    }

    setDefaultDate() {
        const dateInput = document.getElementById('reportDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Date picker
        const dateInput = document.getElementById('reportDate');
        if (dateInput) {
            dateInput.addEventListener('change', () => {
                this.loadCurrentReport();
                this.showToast(`Loaded report for ${dateInput.value}`);
            });
        }

        // Global Edit Button
        const globalEditBtn = document.getElementById('globalEditBtn');
        if (globalEditBtn) {
            globalEditBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleGlobalEditClick();
            });
        }

        // Editable cells
        const editableCells = document.querySelectorAll('.editable-cell');
        editableCells.forEach((cell) => {
            cell.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.editModeEnabled && this.isAuthorized) {
                    this.handleCellClick(cell);
                } else if (!this.isAuthorized) {
                    this.showToast('Please authenticate first using the EDIT button', 'error');
                } else {
                    this.showToast('Please enable edit mode first', 'error');
                }
            });
        });

        // Menu functionality
        this.setupMenuListeners();
        
        // Modal event listeners
        this.setupModalListeners();

        // Action buttons
        this.setupActionButtons();

        // Keyboard navigation and shortcuts
        this.setupKeyboardListeners();

        // Global event listeners
        this.setupGlobalListeners();

        console.log('All event listeners setup complete');
    }

    setupMenuListeners() {
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportCSV();
                this.hideMenu();
            });
        }

        const accessBtn = document.getElementById('accessBtn');
        if (accessBtn) {
            accessBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAccessManagement();
                this.hideMenu();
            });
        }
    }

    setupActionButtons() {
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveCurrentReport();
            });
        }

        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showShareModal();
            });
        }

        const newReportBtn = document.getElementById('newReportBtn');
        if (newReportBtn) {
            newReportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.createNewReport();
            });
        }

        const viewReportsBtn = document.getElementById('viewReportsBtn');
        if (viewReportsBtn) {
            viewReportsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSavedReports();
            });
        }
    }

    setupKeyboardListeners() {
        // Delete key functionality for desktop
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && this.isAuthorized && this.editModeEnabled) {
                const activeCell = document.activeElement;
                if (activeCell && activeCell.classList.contains('editable-cell')) {
                    this.clearCell(activeCell);
                    this.showToast('Cell cleared');
                }
            }
            
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });

        // Arrow key navigation for radio buttons
        document.addEventListener('keydown', (e) => {
            if (e.target.type === 'radio' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                const radios = document.querySelectorAll(`input[name="${e.target.name}"]`);
                const current = Array.from(radios).indexOf(e.target);
                const next = e.key === 'ArrowRight' ? 
                    (current + 1) % radios.length : 
                    (current - 1 + radios.length) % radios.length;
                radios[next].checked = true;
                radios[next].focus();
                this.toggleSessionFields();
            }
        });
    }

    setupGlobalListeners() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-container')) {
                this.hideMenu();
            }
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    }

    setupModalListeners() {
        // Edit Modal (CRT)
        this.setupEditModalListeners();
        
        // Edit Modal (Non-CRT)
        this.setupNonCRTModalListeners();
        
        // Auth Modal
        this.setupAuthModalListeners();
        
        // CSV Modal
        this.setupCSVModalListeners();
        
        // Share Modal
        this.setupShareModalListeners();
        
        // Access Management Modal
        this.setupAccessModalListeners();
        
        // Password Change Modal
        this.setupPasswordChangeModalListeners();
        
        // Reports Modal
        this.setupReportsModalListeners();
    }

    setupEditModalListeners() {
        const modalClose = document.getElementById('modalClose');
        const modalCancel = document.getElementById('modalCancel');
        const modalSave = document.getElementById('modalSave');

        if (modalClose) modalClose.addEventListener('click', () => this.hideEditModal());
        if (modalCancel) modalCancel.addEventListener('click', () => this.hideEditModal());
        if (modalSave) modalSave.addEventListener('click', () => this.saveEditModal());

        // Session type radio buttons
        document.querySelectorAll('input[name="sessionType"]').forEach(radio => {
            radio.addEventListener('change', () => this.toggleSessionFields());
        });

        // Auto-focus and Enter key navigation for CRT fields
        this.setupAutoFocus();
        
        // Add suggestions to inputs
        this.setupSuggestions();
    }

    setupNonCRTModalListeners() {
        const modalCloseNonCRT = document.getElementById('modalCloseNonCRT');
        const modalCancelNonCRT = document.getElementById('modalCancelNonCRT');
        const modalSaveNonCRT = document.getElementById('modalSaveNonCRT');

        if (modalCloseNonCRT) modalCloseNonCRT.addEventListener('click', () => this.hideNonCRTModal());
        if (modalCancelNonCRT) modalCancelNonCRT.addEventListener('click', () => this.hideNonCRTModal());
        if (modalSaveNonCRT) modalSaveNonCRT.addEventListener('click', () => this.saveNonCRTModal());

        // Enter key navigation for Non-CRT fields
        const nonCrtClass = document.getElementById('nonCrtClass');
        const nonCrtFaculty = document.getElementById('nonCrtFaculty');

        if (nonCrtClass) {
            nonCrtClass.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (nonCrtFaculty) nonCrtFaculty.focus();
                }
            });
        }

        if (nonCrtFaculty) {
            nonCrtFaculty.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveNonCRTModal();
                }
            });
        }
    }

    setupAuthModalListeners() {
        const authSubmit = document.getElementById('authSubmit');
        const authEmail = document.getElementById('authEmail');

        if (authSubmit) {
            authSubmit.addEventListener('click', () => this.handleAuth());
        }

        if (authEmail) {
            authEmail.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleAuth();
                }
            });
        }
    }

    setupCSVModalListeners() {
        const csvModalClose = document.getElementById('csvModalClose');
        const downloadBtn = document.getElementById('downloadBtn');
        const openExcelBtn = document.getElementById('openExcelBtn');

        if (csvModalClose) csvModalClose.addEventListener('click', () => this.hideCsvModal());
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadCSVAgain());
        if (openExcelBtn) openExcelBtn.addEventListener('click', () => this.openInExcel());
    }

    setupShareModalListeners() {
        const shareModalClose = document.getElementById('shareModalClose');
        if (shareModalClose) shareModalClose.addEventListener('click', () => this.hideShareModal());

        // Share buttons
        const shareButtons = [
            { id: 'shareWhatsApp', handler: () => this.shareToWhatsApp() },
            { id: 'shareGmail', handler: () => this.shareToGmail() },
            { id: 'shareFacebook', handler: () => this.shareToFacebook() },
            { id: 'shareTwitter', handler: () => this.shareToTwitter() },
            { id: 'shareLinkedIn', handler: () => this.shareToLinkedIn() },
            { id: 'shareTelegram', handler: () => this.shareToTelegram() },
            { id: 'copyLink', handler: () => this.copyLinkToClipboard() },
            { id: 'deviceShare', handler: () => this.deviceShare() }
        ];

        shareButtons.forEach(({ id, handler }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handler();
                });
            }
        });
    }

    setupAccessModalListeners() {
        const accessModalClose = document.getElementById('accessModalClose');
        if (accessModalClose) accessModalClose.addEventListener('click', () => this.hideAccessModal());

        // Email verification
        const verifyEmailBtn = document.getElementById('verifyEmailBtn');
        const accessVerifyEmail = document.getElementById('accessVerifyEmail');

        if (verifyEmailBtn) verifyEmailBtn.addEventListener('click', () => this.verifyAccessEmail());
        if (accessVerifyEmail) {
            accessVerifyEmail.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.verifyAccessEmail();
                }
            });
        }

        // Password verification
        const verifyPasswordBtn = document.getElementById('verifyPasswordBtn');
        const accessPassword = document.getElementById('accessPassword');
        const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

        if (verifyPasswordBtn) verifyPasswordBtn.addEventListener('click', () => this.verifyAccessPassword());
        if (accessPassword) {
            accessPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.verifyAccessPassword();
                }
            });
        }
        if (forgotPasswordBtn) forgotPasswordBtn.addEventListener('click', () => this.handleForgotPassword());

        // Email management
        const addEmailBtn = document.getElementById('addEmailBtn');
        const newEmail = document.getElementById('newEmail');

        if (addEmailBtn) addEmailBtn.addEventListener('click', () => this.addAuthorizedEmail());
        if (newEmail) {
            newEmail.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addAuthorizedEmail();
                }
            });
        }

        // Security options
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const resetPasswordBtn = document.getElementById('resetPasswordBtn');

        if (changePasswordBtn) changePasswordBtn.addEventListener('click', () => this.showPasswordChangeModal());
        if (resetPasswordBtn) resetPasswordBtn.addEventListener('click', () => this.resetPassword());
    }

    setupPasswordChangeModalListeners() {
        const passwordChangeClose = document.getElementById('passwordChangeClose');
        const passwordChangeCancel = document.getElementById('passwordChangeCancel');
        const passwordChangeSave = document.getElementById('passwordChangeSave');

        if (passwordChangeClose) passwordChangeClose.addEventListener('click', () => this.hidePasswordChangeModal());
        if (passwordChangeCancel) passwordChangeCancel.addEventListener('click', () => this.hidePasswordChangeModal());
        if (passwordChangeSave) passwordChangeSave.addEventListener('click', () => this.savePasswordChange());
    }

    setupReportsModalListeners() {
        const reportsModalClose = document.getElementById('reportsModalClose');
        if (reportsModalClose) reportsModalClose.addEventListener('click', () => this.hideSavedReports());
    }

    setupAutoFocus() {
        const inputs = [
            { id: 'crtFaculty', next: 'whichClass' },
            { id: 'whichClass', next: 'collegeFaculty' },
            { id: 'collegeFaculty', next: null },
            { id: 'practiceFaculty', next: null }
        ];
        
        inputs.forEach(input => {
            const element = document.getElementById(input.id);
            if (element) {
                element.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (input.next) {
                            const nextElement = document.getElementById(input.next);
                            if (nextElement && nextElement.offsetParent !== null) {
                                nextElement.focus();
                                return;
                            }
                        }
                        this.saveEditModal();
                    }
                });
            }
        });
    }

    setupSuggestions() {
        const suggestionFields = [
            { id: 'crtFaculty', key: 'crtFaculty' },
            { id: 'whichClass', key: 'whichClass' },
            { id: 'collegeFaculty', key: 'collegeFaculty' },
            { id: 'practiceFaculty', key: 'practiceFaculty' },
            { id: 'nonCrtClass', key: 'nonCrtClass' },
            { id: 'nonCrtFaculty', key: 'nonCrtFaculty' }
        ];

        suggestionFields.forEach(({ id, key }) => {
            const element = document.getElementById(id);
            if (element) {
                // Create datalist for suggestions
                const datalistId = `${id}-suggestions`;
                let datalist = document.getElementById(datalistId);
                if (!datalist) {
                    datalist = document.createElement('datalist');
                    datalist.id = datalistId;
                    element.parentNode.appendChild(datalist);
                    element.setAttribute('list', datalistId);
                }

                // Update datalist on blur
                element.addEventListener('blur', () => {
                    const value = element.value.trim();
                    if (value && !this.suggestions[key].includes(value)) {
                        this.suggestions[key].unshift(value);
                        if (this.suggestions[key].length > 5) {
                            this.suggestions[key] = this.suggestions[key].slice(0, 5);
                        }
                        this.saveSuggestions();
                        this.updateDatalist(datalist, this.suggestions[key]);
                    }
                });

                // Initialize datalist
                this.updateDatalist(datalist, this.suggestions[key]);
            }
        });
    }

    updateDatalist(datalist, suggestions) {
        datalist.innerHTML = '';
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            datalist.appendChild(option);
        });
    }

    // Core functionality methods

    handleGlobalEditClick() {
        if (!this.isAuthorized) {
            this.showAuthModal();
            return;
        }

        this.editModeEnabled = !this.editModeEnabled;
        this.updateGlobalEditButton();
        
        if (this.editModeEnabled) {
            this.showToast('Edit mode enabled! Click on cells to edit them.');
            this.updateCellsEditMode(true);
        } else {
            this.showToast('Edit mode disabled.');
            this.updateCellsEditMode(false);
        }
    }

    updateGlobalEditButton() {
        const globalEditBtn = document.getElementById('globalEditBtn');
        if (!globalEditBtn) return;

        if (!this.isAuthorized) {
            globalEditBtn.innerHTML = '<i class="fas fa-lock"></i> LOCKED';
            globalEditBtn.classList.add('disabled');
        } else if (this.editModeEnabled) {
            globalEditBtn.innerHTML = '<i class="fas fa-times"></i> EXIT EDIT';
            globalEditBtn.classList.add('edit-active');
            globalEditBtn.classList.remove('disabled');
        } else {
            globalEditBtn.innerHTML = '<i class="fas fa-edit"></i> EDIT';
            globalEditBtn.classList.remove('edit-active', 'disabled');
        }
    }

    updateCellsEditMode(enabled) {
        const editableCells = document.querySelectorAll('.editable-cell');
        editableCells.forEach(cell => {
            if (enabled) {
                cell.classList.add('edit-mode');
                cell.title = 'Click to edit this cell';
            } else {
                cell.classList.remove('edit-mode');
                cell.title = 'Enable edit mode to edit this cell';
            }
        });
    }

    handleCellClick(cell) {
        if (!this.editModeEnabled || !this.isAuthorized) return;

        this.currentEditCell = cell;
        const tableNum = cell.dataset.table;
        
        // Show appropriate modal based on table
        if (tableNum === '3') {
            this.showNonCRTModal();
        } else {
            this.showEditModal();
        }
    }

    clearCell(cell) {
        if (!this.isAuthorized || !this.editModeEnabled) return;

        const table = cell.dataset.table;
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const date = this.getCurrentDate();

        // Clear from data
        if (this.reports[date] && this.reports[date][table] && 
            this.reports[date][table][row] && this.reports[date][table][row][col]) {
            delete this.reports[date][table][row][col];
        }

        // Clear display
        cell.innerHTML = '';
        
        // Auto-save
        this.autoSave();
    }

    showAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.remove('hidden');
            const content = authModal.querySelector('.modal-content');
            if (content) {
                content.classList.add('animate__zoomIn');
            }
            
            const authEmail = document.getElementById('authEmail');
            if (authEmail) {
                authEmail.value = '';
                setTimeout(() => authEmail.focus(), 200);
            }
        }
    }

    hideAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            const content = authModal.querySelector('.modal-content');
            if (content) {
                content.classList.remove('animate__zoomIn');
                content.classList.add('animate__zoomOut');
                setTimeout(() => {
                    authModal.classList.add('hidden');
                    content.classList.remove('animate__zoomOut');
                }, 300);
            } else {
                authModal.classList.add('hidden');
            }
        }
        
        const authEmail = document.getElementById('authEmail');
        if (authEmail) authEmail.value = '';
    }

    handleAuth() {
        const authEmail = document.getElementById('authEmail');
        const email = authEmail ? authEmail.value.trim().toLowerCase() : '';
        
        if (!email) {
            this.showToast('Please enter an email address', 'error');
            return;
        }

        if (this.authorizedEmails.includes(email)) {
            this.currentUser = email;
            this.isAuthorized = true;
            this.hideAuthModal();
            this.updateUI();
            this.showToast('Authentication successful! You can now edit reports.');
            
            // Enable edit mode automatically
            this.editModeEnabled = true;
            this.updateGlobalEditButton();
            this.updateCellsEditMode(true);
        } else {
            this.showToast('Access denied. Only authorized users can edit.', 'error');
            this.hideAuthModal();
        }
    }

    showEditModal() {
        const editModal = document.getElementById('editModal');
        if (!editModal) return;
        
        editModal.classList.remove('hidden');
        const content = editModal.querySelector('.modal-content');
        if (content) {
            content.classList.add('animate__zoomIn');
        }
        
        // Load existing data if any
        const cellData = this.getCellData(this.currentEditCell);
        if (cellData) {
            this.populateEditModal(cellData);
        } else {
            this.resetEditModal();
        }
        
        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('crtFaculty');
            if (firstInput) firstInput.focus();
        }, 200);
    }

    hideEditModal() {
        const editModal = document.getElementById('editModal');
        if (editModal) {
            const content = editModal.querySelector('.modal-content');
            if (content) {
                content.classList.remove('animate__zoomIn');
                content.classList.add('animate__zoomOut');
                setTimeout(() => {
                    editModal.classList.add('hidden');
                    content.classList.remove('animate__zoomOut');
                }, 300);
            } else {
                editModal.classList.add('hidden');
            }
        }
        this.resetEditModal();
        this.currentEditCell = null;
    }

    showNonCRTModal() {
        const modal = document.getElementById('editModalNonCRT');
        if (!modal) return;
        
        modal.classList.remove('hidden');
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.classList.add('animate__zoomIn');
        }
        
        // Load existing data if any
        const cellData = this.getCellData(this.currentEditCell);
        if (cellData) {
            this.populateNonCRTModal(cellData);
        } else {
            this.resetNonCRTModal();
        }
        
        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('nonCrtClass');
            if (firstInput) firstInput.focus();
        }, 200);
    }

    hideNonCRTModal() {
        const modal = document.getElementById('editModalNonCRT');
        if (modal) {
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.classList.remove('animate__zoomIn');
                content.classList.add('animate__zoomOut');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    content.classList.remove('animate__zoomOut');
                }, 300);
            } else {
                modal.classList.add('hidden');
            }
        }
        this.resetNonCRTModal();
        this.currentEditCell = null;
    }

    resetEditModal() {
        const fields = ['crtFaculty', 'whichClass', 'collegeFaculty', 'practiceFaculty'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        
        const classRadio = document.querySelector('input[name="sessionType"][value="class"]');
        if (classRadio) classRadio.checked = true;
        
        this.toggleSessionFields();
    }

    resetNonCRTModal() {
        const fields = ['nonCrtClass', 'nonCrtFaculty'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
    }

    populateEditModal(data) {
        if (data.type === 'class') {
            const classRadio = document.querySelector('input[name="sessionType"][value="class"]');
            if (classRadio) classRadio.checked = true;
            
            ['crtFaculty', 'whichClass', 'collegeFaculty'].forEach(field => {
                const element = document.getElementById(field);
                if (element) element.value = data[field] || '';
            });
        } else if (data.type === 'practice') {
            const practiceRadio = document.querySelector('input[name="sessionType"][value="practice"]');
            if (practiceRadio) practiceRadio.checked = true;
            
            const practiceFaculty = document.getElementById('practiceFaculty');
            if (practiceFaculty) practiceFaculty.value = data.practiceFaculty || '';
        }
        
        this.toggleSessionFields();
    }

    populateNonCRTModal(data) {
        const nonCrtClass = document.getElementById('nonCrtClass');
        const nonCrtFaculty = document.getElementById('nonCrtFaculty');
        
        if (nonCrtClass) nonCrtClass.value = data.class || '';
        if (nonCrtFaculty) nonCrtFaculty.value = data.faculty || '';
    }

    toggleSessionFields() {
        const sessionType = document.querySelector('input[name="sessionType"]:checked')?.value || 'class';
        const classFields = document.getElementById('classFields');
        const practiceFields = document.getElementById('practiceFields');
        
        if (classFields && practiceFields) {
            if (sessionType === 'class') {
                classFields.style.display = 'block';
                practiceFields.style.display = 'none';
            } else {
                classFields.style.display = 'none';
                practiceFields.style.display = 'block';
            }
        }
    }

    saveEditModal() {
        const sessionType = document.querySelector('input[name="sessionType"]:checked')?.value || 'class';
        let cellData = { type: sessionType };
        let isValid = false;
        
        if (sessionType === 'class') {
            const crtFaculty = document.getElementById('crtFaculty')?.value.trim() || '';
            const whichClass = document.getElementById('whichClass')?.value.trim() || '';
            const collegeFaculty = document.getElementById('collegeFaculty')?.value.trim() || '';
            
            cellData = {
                type: 'class',
                crtFaculty,
                whichClass,
                collegeFaculty
            };
            
            isValid = crtFaculty || whichClass || collegeFaculty;
        } else {
            const practiceFaculty = document.getElementById('practiceFaculty')?.value.trim() || '';
            
            cellData = {
                type: 'practice',
                practiceFaculty
            };
            
            isValid = practiceFaculty;
        }
        
        if (isValid) {
            this.setCellData(this.currentEditCell, cellData);
            this.updateCellDisplay(this.currentEditCell, cellData);
            this.hideEditModal();
            this.autoSave();
            this.showToast('Cell updated successfully!');
        } else {
            this.showToast('Please fill at least one field', 'error');
        }
    }

    saveNonCRTModal() {
        const nonCrtClass = document.getElementById('nonCrtClass')?.value.trim() || '';
        const nonCrtFaculty = document.getElementById('nonCrtFaculty')?.value.trim() || '';
        
        if (nonCrtClass || nonCrtFaculty) {
            const cellData = {
                type: 'nonCRT',
                class: nonCrtClass,
                faculty: nonCrtFaculty
            };
            
            this.setCellData(this.currentEditCell, cellData);
            this.updateCellDisplay(this.currentEditCell, cellData);
            this.hideNonCRTModal();
            this.autoSave();
            this.showToast('Cell updated successfully!');
        } else {
            this.showToast('Please fill at least one field', 'error');
        }
    }

    getCellData(cell) {
        if (!cell) return null;
        
        const table = cell.dataset.table;
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const date = this.getCurrentDate();
        
        return this.reports[date]?.[table]?.[row]?.[col] || null;
    }

    setCellData(cell, data) {
        if (!cell) return;
        
        const table = cell.dataset.table;
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const date = this.getCurrentDate();
        
        if (!this.reports[date]) this.reports[date] = {};
        if (!this.reports[date][table]) this.reports[date][table] = {};
        if (!this.reports[date][table][row]) this.reports[date][table][row] = {};
        
        this.reports[date][table][row][col] = data;
    }

    updateCellDisplay(cell, data) {
        if (!cell || !data) {
            if (cell) cell.innerHTML = '';
            return;
        }
        
        let html = '<div class="cell-content">';
        
        if (data.type === 'class') {
            html += '<span class="session-type">CLASS</span>';
            if (data.crtFaculty) html += `<span class="detail-line">CRT: ${data.crtFaculty}</span>`;
            if (data.whichClass) html += `<span class="detail-line">Class: ${data.whichClass}</span>`;
            if (data.collegeFaculty) html += `<span class="detail-line">Faculty: ${data.collegeFaculty}</span>`;
        } else if (data.type === 'practice') {
            html += '<span class="session-type">PRACTICE SESSION</span>';
            if (data.practiceFaculty) html += `<span class="detail-line">Faculty: ${data.practiceFaculty}</span>`;
        } else if (data.type === 'nonCRT') {
            html += '<span class="session-type">NON-CRT</span>';
            if (data.class) html += `<span class="detail-line">Class: ${data.class}</span>`;
            if (data.faculty) html += `<span class="detail-line">Faculty: ${data.faculty}</span>`;
        }
        
        html += '</div>';
        cell.innerHTML = html;
    }

    autoSave() {
        if (!this.isAuthorized) return;
        
        // Auto-save after cell edit
        this.saveReports();
        this.showToast('Auto-saved');
    }

    // Enhanced CSV Export
    exportCSV() {
        const date = this.getCurrentDate();
        const reportData = this.reports[date];
        
        if (!reportData || Object.keys(reportData).length === 0) {
            this.showToast('No data to export for the selected date', 'error');
            return;
        }
        
        this.showLoading();
        
        setTimeout(() => {
            try {
                // Create Excel-like CSV with proper formatting
                let csv = `"KAKINADA INSTITUTE OF ENGINEERING TECHNOLOGIES"\n`;
                csv += `"IV B-TECH CLASS SCHEDULE - DAILY REPORT"\n`;
                csv += `"Date: ${date}"\n`;
                csv += `"Generated on: ${new Date().toLocaleString()}"\n\n`;
                
                const tables = [
                    { 
                        id: '1', 
                        name: 'CRT CLASSES', 
                        headers: ['CLASS', '1ST HOUR (9:00-10:30)', '2ND HOUR (10:30-12:00)', '3RD HOUR (1:00-4:00)'], 
                        rows: ['AID(GCC)', 'CSM(K-HUB)', 'CSD(CYBER CREW)'] 
                    },
                    { 
                        id: '2', 
                        name: 'SPECIAL CRT CLASSES', 
                        headers: ['CLASS', '1ST HOUR (9:00-12:00)', '2ND HOUR (1:00-2:30)', '3RD HOUR (2:30-4:00)'], 
                        rows: ['CAI(A-212)', 'CSC(seminar hall-2)'] 
                    },
                    { 
                        id: '3', 
                        name: 'NON CRT CLASSES DAILY REPORT', 
                        headers: ['CLASS', '1ST HOUR (8:40-10:30)', '2ND HOUR (10:30-12:00)', '3RD HOUR (1:30-2:30)', '4TH HOUR (2:30-4:00)'], 
                        rows: ['nonCRT class 1 (A-210)'] 
                    }
                ];
                
                tables.forEach(table => {
                    csv += `"${table.name}"\n`;
                    csv += table.headers.map(h => `"${h}"`).join(',') + '\n';
                    
                    table.rows.forEach((rowName, rowIndex) => {
                        let row = [`"${rowName}"`];
                        for (let col = 1; col < table.headers.length; col++) {
                            const cellData = reportData[table.id]?.[rowIndex]?.[col];
                            if (cellData) {
                                let cellText = '';
                                if (cellData.type === 'class') {
                                    cellText = 'CLASS';
                                    if (cellData.crtFaculty) cellText += ` | CRT: ${cellData.crtFaculty}`;
                                    if (cellData.whichClass) cellText += ` | Class: ${cellData.whichClass}`;
                                    if (cellData.collegeFaculty) cellText += ` | Faculty: ${cellData.collegeFaculty}`;
                                } else if (cellData.type === 'practice') {
                                    cellText = 'PRACTICE SESSION';
                                    if (cellData.practiceFaculty) cellText += ` | Faculty: ${cellData.practiceFaculty}`;
                                } else if (cellData.type === 'nonCRT') {
                                    cellText = 'NON-CRT';
                                    if (cellData.class) cellText += ` | Class: ${cellData.class}`;
                                    if (cellData.faculty) cellText += ` | Faculty: ${cellData.faculty}`;
                                }
                                row.push(`"${cellText}"`);
                            } else {
                                row.push('""');
                            }
                        }
                        csv += row.join(',') + '\n';
                    });
                    csv += '\n';
                });
                
                // Add footer
                csv += `"Report generated by Daily Report System"\n`;
                csv += `"© ${new Date().getFullYear()} Kakinada Institute of Engineering Technologies"\n`;
                
                // Create CSV blob and download
                this.csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                this.csvFileName = `daily-report-${date}.csv`;
                
                this.downloadCSVFile();
                this.hideLoading();
                this.showCsvModal();
                
            } catch (error) {
                this.hideLoading();
                this.showToast('Error exporting report', 'error');
                console.error('Export error:', error);
            }
        }, 1000);
    }

    downloadCSVFile() {
        if (!this.csvBlob) return;
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(this.csvBlob);
        link.setAttribute('href', url);
        link.setAttribute('download', this.csvFileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    showCsvModal() {
        const csvModal = document.getElementById('csvModal');
        const fileNameSpan = document.getElementById('fileName');
        const downloadPath = document.getElementById('downloadPath');
        const previewContent = document.getElementById('previewContent');
        
        if (csvModal && fileNameSpan) {
            fileNameSpan.textContent = this.csvFileName;
            
            // Update download path based on OS
            const userAgent = navigator.userAgent;
            let pathText = '~/Downloads/';
            if (userAgent.includes('Windows')) {
                pathText = 'C:\\Users\\[Username]\\Downloads\\';
            } else if (userAgent.includes('Mac')) {
                pathText = '/Users/[Username]/Downloads/';
            }
            if (downloadPath) downloadPath.textContent = pathText + this.csvFileName;
            
            // Show preview
            if (previewContent && this.csvBlob) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = e.target.result.split('\n').slice(0, 10).join('\n');
                    previewContent.textContent = preview + '\n... (preview limited to first 10 lines)';
                };
                reader.readAsText(this.csvBlob);
            }
            
            csvModal.classList.remove('hidden');
            const content = csvModal.querySelector('.modal-content');
            if (content) {
                content.classList.add('animate__zoomIn');
            }
        }
    }

    hideCsvModal() {
        const csvModal = document.getElementById('csvModal');
        if (csvModal) {
            const content = csvModal.querySelector('.modal-content');
            if (content) {
                content.classList.remove('animate__zoomIn');
                content.classList.add('animate__zoomOut');
                setTimeout(() => {
                    csvModal.classList.add('hidden');
                    content.classList.remove('animate__zoomOut');
                }, 300);
            } else {
                csvModal.classList.add('hidden');
            }
        }
    }

    downloadCSVAgain() {
        this.downloadCSVFile();
        this.showToast('File downloaded again!');
    }

    openInExcel() {
        if (!this.csvBlob) return;
        
        try {
            // For Windows - try to use msSaveOrOpenBlob
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(this.csvBlob, this.csvFileName.replace('.csv', '.xlsx'));
                this.showToast('Opening in Excel...');
                return;
            }
            
            // For other platforms - create a temporary download with Excel MIME type
            const excelBlob = new Blob([this.csvBlob], { 
                type: 'application/vnd.ms-excel' 
            });
            
            const link = document.createElement('a');
            const url = URL.createObjectURL(excelBlob);
            link.setAttribute('href', url);
            link.setAttribute('download', this.csvFileName.replace('.csv', '.xlsx'));
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showToast('Excel file created! Please open it with Microsoft Excel.');
        } catch (error) {
            this.showToast('Please download the CSV file and open it manually in Excel', 'error');
        }
    }

    // Enhanced Share Modal
    showShareModal() {
        const shareModal = document.getElementById('shareModal');
        const shareUrl = document.getElementById('shareUrl');
        
        if (shareModal && shareUrl) {
            shareUrl.value = window.location.href;
            shareModal.classList.remove('hidden');
            const content = shareModal.querySelector('.modal-content');
            if (content) {
                content.classList.add('animate__zoomIn');
            }
        }
    }

    hideShareModal() {
        const shareModal = document.getElementById('shareModal');
        if (shareModal) {
            const content = shareModal.querySelector('.modal-content');
            if (content) {
                content.classList.remove('animate__zoomIn');
                content.classList.add('animate__zoomOut');
                setTimeout(() => {
                    shareModal.classList.add('hidden');
                    content.classList.remove('animate__zoomOut');
                }, 300);
            } else {
                shareModal.classList.add('hidden');
            }
        }
    }

    shareToWhatsApp() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Check out this Daily Report application for B-Tech 4th Year class schedules!');
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
        this.showToast('Opening WhatsApp...');
    }

    shareToGmail() {
        const url = encodeURIComponent(window.location.href);
        const subject = encodeURIComponent('Daily Report - B-Tech 4th Year');
        const body = encodeURIComponent(`Check out this Daily Report application for tracking B-Tech 4th Year class schedules:\n\n${window.location.href}`);
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
        this.showToast('Opening Gmail...');
    }

    shareToFacebook() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        this.showToast('Opening Facebook...');
    }

    shareToTwitter() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Check out this Daily Report application for B-Tech 4th Year! 📚');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        this.showToast('Opening Twitter...');
    }

    shareToLinkedIn() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        this.showToast('Opening LinkedIn...');
    }

    shareToTelegram() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Check out this Daily Report application for B-Tech 4th Year class schedules!');
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
        this.showToast('Opening Telegram...');
    }

    async copyLinkToClipboard() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            this.showToast('Link copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            const dummy = document.createElement('textarea');
            document.body.appendChild(dummy);
            dummy.value = window.location.href;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            this.showToast('Link copied to clipboard!');
        }
    }

    async deviceShare() {
        const shareData = {
            title: 'Daily Report - B-Tech 4th Year',
            text: 'Check out this daily report application for tracking class schedules',
            url: window.location.href
        };
        
        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                this.showToast('Shared successfully!');
            } else {
                await this.copyLinkToClipboard();
            }
        } catch (error) {
            console.error('Share error:', error);
            await this.copyLinkToClipboard();
        }
    }

    // Enhanced Access Management
    showAccessManagement() {
        const accessModal = document.getElementById('accessModal');
        if (!accessModal) return;
        
        // Reset to first step
        this.showEmailVerificationStep();
        
        accessModal.classList.remove('hidden');
        const content = accessModal.querySelector('.modal-content');
        if (content) {
            content.classList.add('animate__zoomIn');
        }
    }

    hideAccessModal() {
        const accessModal = document.getElementById('accessModal');
        if (accessModal) {
            const content = accessModal.querySelector('.modal-content');
            if (content) {
                content.classList.remove('animate__zoomIn');
                content.classList.add('animate__zoomOut');
                setTimeout(() => {
                    accessModal.classList.add('hidden');
                    content.classList.remove('animate__zoomOut');
                }, 300);
            } else {
                accessModal.classList.add('hidden');
            }
        }
        
        // Clear inputs
        const inputs = ['accessVerifyEmail', 'accessPassword', 'newEmail'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
    }

    showEmailVerificationStep() {
        document.getElementById('emailVerificationStep').classList.remove('hidden');
        document.getElementById('passwordVerificationStep').classList.add('hidden');
        document.getElementById('accessManagementStep').classList.add('hidden');
        
        setTimeout(() => {
            const emailInput = document.getElementById('accessVerifyEmail');
            if (emailInput) emailInput.focus();
        }, 200);
    }

    showPasswordVerificationStep() {
        document.getElementById('emailVerificationStep').classList.add('hidden');
        document.getElementById('passwordVerificationStep').classList.remove('hidden');
        document.getElementById('accessManagementStep').classList.add('hidden');
        
        setTimeout(() => {
            const passwordInput = document.getElementById('accessPassword');
            if (passwordInput) passwordInput.focus();
        }, 200);
    }

    showAccessManagementStep() {
        document.getElementById('emailVerificationStep').classList.add('hidden');
        document.getElementById('passwordVerificationStep').classList.add('hidden');
        document.getElementById('accessManagementStep').classList.remove('hidden');
        
        this.updateAccessManagementContent();
    }

    verifyAccessEmail() {
        const accessVerifyEmail = document.getElementById('accessVerifyEmail');
        const email = accessVerifyEmail ? accessVerifyEmail.value.trim().toLowerCase() : '';
        
        if (!email) {
            this.showToast('Please enter your email address', 'error');
            return;
        }
        
        if (this.authorizedEmails.includes(email)) {
            this.showPasswordVerificationStep();
        } else {
            this.showToast('No permission to access. Only authorized emails can manage access.', 'error');
        }
    }

    async verifyAccessPassword() {
        const accessPassword = document.getElementById('accessPassword');
        const password = accessPassword ? accessPassword.value : '';
        
        if (!password) {
            this.showToast('Please enter the password', 'error');
            return;
        }
        
        const passwordHash = await this.hashPassword(password);
        if (passwordHash === this.adminPasswordHash) {
            this.showAccessManagementStep();
        } else {
            this.showToast('Incorrect password. Please try again.', 'error');
        }
    }

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(hash)));
    }

    handleForgotPassword() {
        // Show email verification for password reset
        const email = prompt('Enter your email for password reset verification:');
        if (email && this.authorizedEmails.includes(email.toLowerCase())) {
            this.showToast('Password reset link sent to your email. Check your inbox.', 'success');
            // In a real application, this would send an actual email
        } else {
            this.showToast('Email not found in authorized list', 'error');
        }
    }

    updateAccessManagementContent() {
        // Update current status
        const currentUserEmail = document.getElementById('currentUserEmail');
        const currentAccessLevel = document.getElementById('currentAccessLevel');
        
        if (currentUserEmail) {
            currentUserEmail.textContent = this.currentUser || 'None';
        }
        
        if (currentAccessLevel) {
            currentAccessLevel.textContent = this.isAuthorized ? '✅ Authorized' : '❌ Unauthorized';
            currentAccessLevel.style.color = this.isAuthorized ? '#8B4513' : '#dc3545';
        }
        
        // Update authorized emails list
        const emailsList = document.getElementById('authorizedEmailsList');
        if (emailsList) {
            let html = '';
            this.authorizedEmails.forEach((email, index) => {
                const isDefault = email === 'dhemanth369@gmail.com';
                const maskedEmail = this.maskEmail(email);
                html += `
                    <div class="email-item">
                        <span class="email-address">${maskedEmail}${isDefault ? ' (Default Admin)' : ''}</span>
                        ${!isDefault ? `<button class="remove-btn" onclick="window.app.removeAuthorizedEmail('${email}')">Remove</button>` : ''}
                    </div>
                `;
            });
            emailsList.innerHTML = html;
        }
    }

    maskEmail(email) {
        const [username, domain] = email.split('@');
        const maskedUsername = username.length > 2 ? 
            username[0] + '*'.repeat(username.length - 2) + username[username.length - 1] : 
            username;
        return `${maskedUsername}@${domain}`;
    }

    addAuthorizedEmail() {
        const newEmailInput = document.getElementById('newEmail');
        const email = newEmailInput ? newEmailInput.value.trim().toLowerCase() : '';
        
        if (!email) {
            this.showToast('Please enter an email address', 'error');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }
        
        if (this.authorizedEmails.includes(email)) {
            this.showToast('This email is already authorized', 'error');
            return;
        }
        
        this.authorizedEmails.push(email);
        this.saveAuthorizedEmails();
        this.updateAccessManagementContent();
        newEmailInput.value = '';
        this.showToast(`Added ${email} to authorized emails`);
    }

    removeAuthorizedEmail(email) {
        if (email === 'dhemanth369@gmail.com') {
            this.showToast('Cannot remove default admin email', 'error');
            return;
        }
        
        const index = this.authorizedEmails.indexOf(email);
        if (index > -1) {
            this.authorizedEmails.splice(index, 1);
            this.saveAuthorizedEmails();
            this.updateAccessManagementContent();
            this.showToast(`Removed ${email} from authorized emails`);
        }
    }

    showPasswordChangeModal() {
        const modal = document.getElementById('passwordChangeModal');
        if (modal) {
            modal.classList.remove('hidden');
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.classList.add('animate__zoomIn');
            }
            
            setTimeout(() => {
                const currentPassword = document.getElementById('currentPassword');
                if (currentPassword) currentPassword.focus();
            }, 200);
        }
    }

    hidePasswordChangeModal() {
        const modal = document.getElementById('passwordChangeModal');
        if (modal) {
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.classList.remove('animate__zoomIn');
                content.classList.add('animate__zoomOut');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    content.classList.remove('animate__zoomOut');
                }, 300);
            } else {
                modal.classList.add('hidden');
            }
        }
        
        // Clear inputs
        ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
    }

    async savePasswordChange() {
        const currentPassword = document.getElementById('currentPassword')?.value || '';
        const newPassword = document.getElementById('newPassword')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showToast('Please fill all password fields', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showToast('New passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            this.showToast('New password must be at least 6 characters long', 'error');
            return;
        }
        
        const currentPasswordHash = await this.hashPassword(currentPassword);
        if (currentPasswordHash !== this.adminPasswordHash) {
            this.showToast('Current password is incorrect', 'error');
            return;
        }
        
        this.adminPasswordHash = await this.hashPassword(newPassword);
        this.saveAdminPassword();
        this.hidePasswordChangeModal();
        this.showToast('Password changed successfully');
    }

    resetPassword() {
        const email = prompt('Enter your email for password reset:');
        if (email && this.authorizedEmails.includes(email.toLowerCase())) {
            // Reset to default password
            this.adminPasswordHash = 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg='; // 'admin123'
            this.saveAdminPassword();
            this.showToast('Password has been reset to default (admin123). Please change it immediately.');
        } else {
            this.showToast('Email not found in authorized list', 'error');
        }
    }

    // Utility methods
    getCurrentDate() {
        const dateInput = document.getElementById('reportDate');
        return dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    }

    updateUI() {
        const accessBtn = document.getElementById('accessBtn');
        
        if (this.isAuthorized) {
            if (accessBtn) accessBtn.style.display = 'block';
        } else {
            if (accessBtn) accessBtn.style.display = 'none';
        }
        
        this.updateGlobalEditButton();
    }

    saveCurrentReport() {
        if (!this.isAuthorized) {
            this.showToast('You need to be authorized to save reports', 'error');
            return;
        }

        this.showLoading();
        
        setTimeout(() => {
            const date = this.getCurrentDate();
            const success = this.saveReports();
            this.hideLoading();
            
            if (success) {
                this.showProfessionalSaveToast(`Report saved successfully for ${date}!`);
            } else {
                this.showToast('Error saving report', 'error');
            }
        }, 800);
    }

    showProfessionalSaveToast(message) {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing && !existing.classList.contains('closing')) {
            existing.classList.add('closing');
            setTimeout(() => existing.remove(), 300);
        }
        
        // Create new professional toast
        const toast = document.createElement('div');
        toast.className = 'toast slide-up';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 2.5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('closing');
                setTimeout(() => {
                    if (toast.parentNode) toast.remove();
                }, 300);
            }
        }, 2500);
    }

    createNewReport() {
        if (!this.isAuthorized) {
            this.showToast('You need to be authorized to create new reports', 'error');
            return;
        }
        
        // Clear all cells
        document.querySelectorAll('.editable-cell').forEach(cell => {
            cell.innerHTML = '';
        });
        
        // Set to today's date
        const dateInput = document.getElementById('reportDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        this.showToast('New report created for today');
    }

    loadCurrentReport() {
        const date = this.getCurrentDate();
        const reportData = this.reports[date];
        
        // Clear all cells
        document.querySelectorAll('.editable-cell').forEach(cell => {
            cell.innerHTML = '';
        });
        
        if (reportData) {
            Object.keys(reportData).forEach(tableId => {
                const tableData = reportData[tableId];
                Object.keys(tableData).forEach(rowIndex => {
                    const rowData = tableData[rowIndex];
                    Object.keys(rowData).forEach(colIndex => {
                        const cellData = rowData[colIndex];
                        const cell = document.querySelector(
                            `.editable-cell[data-table="${tableId}"][data-row="${rowIndex}"][data-col="${colIndex}"]`
                        );
                        if (cell && cellData) {
                            this.updateCellDisplay(cell, cellData);
                        }
                    });
                });
            });
        }
    }

    showSavedReports() {
        const modal = document.getElementById('reportsModal');
        const reportsList = document.getElementById('reportsList');
        
        if (!modal || !reportsList) return;
        
        const dates = Object.keys(this.reports).sort().reverse();
        
        if (dates.length === 0) {
            reportsList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <h4>No Saved Reports</h4>
                    <p>No reports have been saved yet. Create and save a report to see it here.</p>
                </div>
            `;
        } else {
            let html = '<div class="reports-list">';
            dates.forEach(date => {
                const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                html += `
                    <div class="report-item">
                        <div class="report-date">${formattedDate}</div>
                        <div style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 1rem;">
                            Date: ${date}
                        </div>
                        <div class="report-actions">
                            <button class="btn btn--sm btn--secondary" onclick="window.app.loadReport('${date}')">
                                <i class="fas fa-eye"></i> Load Report
                            </button>
                            <button class="btn btn--sm" onclick="window.app.deleteReport('${date}')" 
                                    style="background: #dc3545; color: white; border-color: #dc3545;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            reportsList.innerHTML = html;
        }
        
        modal.classList.remove('hidden');
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.classList.add('animate__zoomIn');
        }
    }

    hideSavedReports() {
        const modal = document.getElementById('reportsModal');
        if (modal) {
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.classList.remove('animate__zoomIn');
                content.classList.add('animate__zoomOut');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    content.classList.remove('animate__zoomOut');
                }, 300);
            } else {
                modal.classList.add('hidden');
            }
        }
    }

    loadReport(date) {
        const dateInput = document.getElementById('reportDate');
        if (dateInput) dateInput.value = date;
        
        this.loadCurrentReport();
        this.hideSavedReports();
        this.showToast(`Report loaded for ${date}`);
    }

    deleteReport(date) {
        if (confirm(`Are you sure you want to delete the report for ${date}?\n\nThis action cannot be undone.`)) {
            delete this.reports[date];
            this.saveReports();
            this.showSavedReports(); // Refresh the list
            this.showToast(`Report deleted for ${date}`);
        }
    }

    toggleMenu() {
        const dropdown = document.getElementById('menuDropdown');
        if (dropdown) {
            const isHidden = dropdown.classList.contains('hidden');
            if (isHidden) {
                dropdown.classList.remove('hidden');
            } else {
                dropdown.classList.add('closing');
                setTimeout(() => {
                    dropdown.classList.add('hidden');
                    dropdown.classList.remove('closing');
                }, 300);
            }
        }
    }

    hideMenu() {
        const dropdown = document.getElementById('menuDropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('closing');
            setTimeout(() => {
                dropdown.classList.add('hidden');
                dropdown.classList.remove('closing');
            }, 300);
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            if (!modal.classList.contains('hidden')) {
                const content = modal.querySelector('.modal-content');
                if (content) {
                    content.classList.add('animate__zoomOut');
                    setTimeout(() => {
                        modal.classList.add('hidden');
                        content.classList.remove('animate__zoomOut');
                    }, 300);
                } else {
                    modal.classList.add('hidden');
                }
            }
        });
        this.currentEditCell = null;
    }

    showToast(message, type = 'success') {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing && !existing.classList.contains('closing')) {
            existing.classList.add('closing');
            setTimeout(() => existing.remove(), 300);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast slide-up`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        if (type === 'error') {
            toast.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
        }
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('closing');
                setTimeout(() => {
                    if (toast.parentNode) toast.remove();
                }, 300);
            }
        }, 3000);
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.remove('hidden');
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.add('hidden');
    }

    // Data persistence methods
    saveReports() {
        try {
            localStorage.setItem('dailyReports', JSON.stringify(this.reports));
            return true;
        } catch (error) {
            console.error('Error saving reports:', error);
            return false;
        }
    }

    loadReports() {
        try {
            const saved = localStorage.getItem('dailyReports');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading reports:', error);
            return {};
        }
    }

    saveAuthorizedEmails() {
        try {
            localStorage.setItem('authorizedEmails', JSON.stringify(this.authorizedEmails));
        } catch (error) {
            console.error('Error saving authorized emails:', error);
        }
    }

    loadAuthorizedEmails() {
        try {
            const saved = localStorage.getItem('authorizedEmails');
            if (saved) {
                const emails = JSON.parse(saved);
                if (!emails.includes('dhemanth369@gmail.com')) {
                    emails.unshift('dhemanth369@gmail.com');
                }
                this.authorizedEmails = emails;
            }
        } catch (error) {
            console.error('Error loading authorized emails:', error);
        }
    }

    saveSuggestions() {
        try {
            localStorage.setItem('suggestions', JSON.stringify(this.suggestions));
        } catch (error) {
            console.error('Error saving suggestions:', error);
        }
    }

    loadSuggestions() {
        try {
            const saved = localStorage.getItem('suggestions');
            if (saved) {
                this.suggestions = { ...this.suggestions, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }

    saveAdminPassword() {
        try {
            localStorage.setItem('adminPasswordHash', this.adminPasswordHash);
        } catch (error) {
            console.error('Error saving admin password:', error);
        }
    }

    loadAdminPassword() {
        try {
            const saved = localStorage.getItem('adminPasswordHash');
            if (saved) {
                this.adminPasswordHash = saved;
            }
        } catch (error) {
            console.error('Error loading admin password:', error);
        }
    }
}

// Initialize app when DOM is ready
let app = null;

function initializeApp() {
    if (!app) {
        app = new DailyReportApp();
        window.app = app; // Make globally available
        console.log('App initialized successfully');
    }
}

// Multiple initialization methods to ensure app loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Fallback initialization
setTimeout(initializeApp, 100);