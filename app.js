// Daily Report Application JavaScript - Bug Fixes Applied

class DailyReportApp {
    constructor() {
        this.authorizedEmails = ["dhemanth369@gmail.com"];
        this.currentUser = null;
        this.isAuthorized = false;
        this.currentEditCell = null;
        this.editModeEnabled = false;
        this.currentTable = null;
        this.reports = this.loadReports();
        this.csvBlob = null;
        this.csvFileName = '';
        
        // Load authorized emails from storage
        this.loadAuthorizedEmails();
        
        // Ensure proper initialization
        this.initializeApp();
    }

    initializeApp() {
        // Set timeout to ensure DOM is fully ready
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
            dateInput.value = '2025-07-30';
            console.log('Default date set to:', dateInput.value);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Date picker
        const dateInput = document.getElementById('reportDate');
        if (dateInput) {
            dateInput.addEventListener('change', () => {
                this.loadCurrentReport();
                this.showMessage(`Loaded report for ${dateInput.value}`, 'success');
            });
        }

        // Edit buttons for each table - FIXED
        ['editBtn1', 'editBtn2', 'editBtn3'].forEach(btnId => {
            const editBtn = document.getElementById(btnId);
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const tableNum = editBtn.dataset.table;
                    console.log(`Edit button ${btnId} clicked for table ${tableNum}`);
                    this.handleEditButtonClick(tableNum);
                });
                console.log(`Edit button ${btnId} listener attached`);
            }
        });

        // Editable cells - Only work when edit mode is enabled
        const editableCells = document.querySelectorAll('.editable-cell');
        console.log(`Found ${editableCells.length} editable cells`);
        
        editableCells.forEach((cell, index) => {
            cell.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Cell ${index} clicked, edit mode: ${this.editModeEnabled}, authorized: ${this.isAuthorized}`);
                
                if (this.editModeEnabled && this.isAuthorized) {
                    this.handleCellClick(cell);
                } else if (!this.isAuthorized) {
                    this.showMessage('❌ Please use the EDIT button to enable editing mode', 'error');
                } else {
                    this.showMessage('❌ Please click EDIT button first to enable editing mode', 'error');
                }
            });
        });

        // Menu functionality - FIXED
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Menu button clicked');
                this.toggleMenu();
            });
            console.log('Menu button listener attached');
        }

        // Export functionality - Enhanced
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Export button clicked');
                this.exportCSV();
                this.hideMenu();
            });
            console.log('Export button listener attached');
        }

        // Share functionality - Enhanced
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Share button clicked');
                this.showShareModal();
                this.hideMenu();
            });
            console.log('Share button listener attached');
        }

        // Access management - Fixed
        const accessBtn = document.getElementById('accessBtn');
        if (accessBtn) {
            accessBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Access button clicked');
                this.showAccessManagement();
                this.hideMenu();
            });
            console.log('Access button listener attached');
        }

        // Modal event listeners
        this.setupModalListeners();

        // Action buttons
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.replaceWith(saveBtn.cloneNode(true));
            const newSaveBtn = document.getElementById('saveBtn');
            newSaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Save button clicked');
                this.saveCurrentReport();
            });
            console.log('Save button listener attached');
        }

        const viewReportsBtn = document.getElementById('viewReportsBtn');
        if (viewReportsBtn) {
            viewReportsBtn.replaceWith(viewReportsBtn.cloneNode(true));
            const newViewBtn = document.getElementById('viewReportsBtn');
            newViewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('View Reports button clicked');
                this.showSavedReports();
            });
            console.log('View Reports button listener attached');
        }

        // Session type radio buttons
        document.querySelectorAll('input[name="sessionType"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.toggleSessionFields();
            });
        });

        // Auto-focus navigation
        this.setupAutoFocus();

        // Global event listeners
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-container')) {
                this.hideMenu();
            }
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });

        console.log('All event listeners setup complete');
    }

    handleEditButtonClick(tableNum) {
        console.log(`Edit button clicked for table ${tableNum}, authorized: ${this.isAuthorized}`);
        
        if (!this.isAuthorized) {
            console.log('Not authorized, showing auth modal');
            this.currentTable = tableNum;
            this.showAuthModal();
            return;
        }

        // Toggle edit mode for this table
        this.editModeEnabled = !this.editModeEnabled;
        this.currentTable = tableNum;
        
        const editBtn = document.getElementById(`editBtn${tableNum}`);
        if (this.editModeEnabled) {
            editBtn.textContent = 'EXIT EDIT';
            editBtn.style.background = '#ff4444';
            this.showMessage(`✅ Edit mode enabled for table ${tableNum}. Click on cells to edit them.`, 'success');
        } else {
            editBtn.textContent = 'EDIT';
            editBtn.style.background = 'var(--color-edit-btn)';
            this.showMessage(`❌ Edit mode disabled for table ${tableNum}.`, 'success');
        }
    }

    setupModalListeners() {
        // Edit Modal
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideEditModal();
            });
        }

        const modalCancel = document.getElementById('modalCancel');
        if (modalCancel) {
            modalCancel.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideEditModal();
            });
        }

        const modalSave = document.getElementById('modalSave');
        if (modalSave) {
            modalSave.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveEditModal();
            });
        }

        // Auth Modal - FIXED
        const authSubmit = document.getElementById('authSubmit');
        if (authSubmit) {
            authSubmit.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Auth submit button clicked');
                this.handleAuth();
            });
        }

        const authEmail = document.getElementById('authEmail');
        if (authEmail) {
            authEmail.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleAuth();
                }
            });
        }

        // CSV Export Modal
        const csvModalClose = document.getElementById('csvModalClose');
        if (csvModalClose) {
            csvModalClose.addEventListener('click', () => this.hideCsvModal());
        }

        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadCSVAgain());
        }

        // Share Modal - FIXED
        const shareModalClose = document.getElementById('shareModalClose');
        if (shareModalClose) {
            shareModalClose.addEventListener('click', () => this.hideShareModal());
        }

        this.setupShareButtons();

        // Access Management Modal
        const accessModalClose = document.getElementById('accessModalClose');
        if (accessModalClose) {
            accessModalClose.addEventListener('click', () => this.hideAccessModal());
        }

        const addEmailBtn = document.getElementById('addEmailBtn');
        if (addEmailBtn) {
            addEmailBtn.addEventListener('click', () => this.addAuthorizedEmail());
        }

        const newEmailInput = document.getElementById('newEmail');
        if (newEmailInput) {
            newEmailInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addAuthorizedEmail();
                }
            });
        }

        // Reports Modal
        const reportsModalClose = document.getElementById('reportsModalClose');
        if (reportsModalClose) {
            reportsModalClose.addEventListener('click', () => this.hideSavedReports());
        }

        console.log('All modal listeners setup complete');
    }

    setupShareButtons() {
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
                console.log(`Share button ${id} listener attached`);
            }
        });
    }

    getCurrentDate() {
        const dateInput = document.getElementById('reportDate');
        return dateInput ? dateInput.value : '2025-07-30';
    }

    handleCellClick(cell) {
        if (!this.editModeEnabled || !this.isAuthorized) {
            return;
        }

        console.log('Handle cell click called for authorized edit mode');
        this.currentEditCell = cell;
        this.showEditModal();
    }

    showAuthModal() {
        console.log('Showing auth modal');
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.remove('hidden');
            
            const authEmail = document.getElementById('authEmail');
            if (authEmail) {
                // Clear any existing value and disable autocomplete
                authEmail.value = '';
                authEmail.setAttribute('autocomplete', 'off');
                authEmail.setAttribute('autocomplete', 'new-password');
                setTimeout(() => authEmail.focus(), 200);
            }
            console.log('Auth modal shown successfully');
        } else {
            console.error('Auth modal not found');
        }
    }

    hideAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.add('hidden');
        }
        
        const authEmail = document.getElementById('authEmail');
        if (authEmail) {
            authEmail.value = '';
        }
    }

    handleAuth() {
        const authEmail = document.getElementById('authEmail');
        const email = authEmail ? authEmail.value.trim().toLowerCase() : '';
        
        console.log('Handle auth called with email:', email);
        
        if (!email) {
            this.showMessage('Please enter an email address', 'error');
            return;
        }

        if (this.authorizedEmails.includes(email)) {
            this.currentUser = email;
            this.isAuthorized = true;
            this.hideAuthModal();
            this.updateUI();
            this.showMessage('✅ Authentication successful! You can now use EDIT buttons.', 'success');
            
            console.log('Authentication successful for:', email);
            
            // Enable edit mode for the current table
            if (this.currentTable) {
                this.editModeEnabled = true;
                const editBtn = document.getElementById(`editBtn${this.currentTable}`);
                if (editBtn) {
                    editBtn.textContent = 'EXIT EDIT';
                    editBtn.style.background = '#ff4444';
                }
                this.showMessage(`✅ Edit mode enabled for table ${this.currentTable}. Click on cells to edit them.`, 'success');
            }
        } else {
            this.isAuthorized = false;
            this.hideAuthModal();
            this.showMessage('❌ Access denied. Only authorized users can edit.', 'error');
            this.updateReadOnlyUI();
            console.log('Authentication failed for:', email);
        }
    }

    updateUI() {
        const accessBtn = document.getElementById('accessBtn');
        const editButtons = document.querySelectorAll('.edit-btn');
        const editableCells = document.querySelectorAll('.editable-cell');
        
        console.log(`Updating UI - authorized: ${this.isAuthorized}`);
        
        if (this.isAuthorized) {
            if (accessBtn) {
                accessBtn.style.display = 'block';
                console.log('Access button shown');
            }
            editButtons.forEach(btn => {
                btn.classList.remove('hidden');
                console.log('Edit button shown:', btn.id);
            });
            editableCells.forEach(cell => {
                cell.classList.remove('read-only');
                cell.title = 'Click EDIT button first, then click to edit';
            });
        } else {
            if (accessBtn) {
                accessBtn.style.display = 'none';
                console.log('Access button hidden');
            }
            editButtons.forEach(btn => {
                btn.classList.add('hidden');
                console.log('Edit button hidden:', btn.id);
            });
            editableCells.forEach(cell => {
                cell.title = 'View only - Click EDIT to authenticate';
            });
        }
    }

    updateReadOnlyUI() {
        const editableCells = document.querySelectorAll('.editable-cell');
        editableCells.forEach(cell => {
            cell.classList.add('read-only');
            cell.style.cursor = 'not-allowed';
            cell.title = 'Read-only access';
        });
    }

    showEditModal() {
        console.log('Showing edit modal');
        const editModal = document.getElementById('editModal');
        if (!editModal) {
            console.error('Edit modal not found');
            return;
        }
        
        editModal.classList.remove('hidden');
        
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
            editModal.classList.add('hidden');
        }
        this.resetEditModal();
        this.currentEditCell = null;
    }

    resetEditModal() {
        const fields = ['crtFaculty', 'whichClass', 'collegeFaculty', 'practiceFaculty'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
                field.setAttribute('autocomplete', 'off');
                field.setAttribute('autocomplete', 'new-password');
            }
        });
        
        const classRadio = document.querySelector('input[name="sessionType"][value="class"]');
        if (classRadio) classRadio.checked = true;
        
        this.toggleSessionFields();
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
            this.showMessage('✅ Cell updated successfully!', 'success');
        } else {
            this.showMessage('⚠️ Please fill at least one field', 'error');
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
        }
        
        html += '</div>';
        cell.innerHTML = html;
    }

    // Enhanced CSV Export with Excel Support
    exportCSV() {
        console.log('Export CSV called');
        const date = this.getCurrentDate();
        const reportData = this.reports[date];
        
        if (!reportData || Object.keys(reportData).length === 0) {
            this.showMessage('⚠️ No data to export for the selected date', 'error');
            return;
        }
        
        this.showLoading();
        
        setTimeout(() => {
            try {
                let csv = `Daily Report Export - ${date}\n\n`;
                
                const tables = [
                    { id: '1', name: 'CRT CLASSES', headers: ['CLASS', '1ST HOUR (9:00-10:30)', '2ND HOUR (10:30-12:00)', '3RD HOUR (1:00-4:00)'], rows: ['AID(GCC)', 'CSM(K-HUB)', 'CSD(CYBER CREW)'] },
                    { id: '2', name: 'TABLE 2', headers: ['CLASS', '1ST HOUR (9:00-12:00)', '2ND HOUR (1:00-2:30)', '3RD HOUR (2:30-4:00)'], rows: ['CAI(A-212)', 'CSC(seminar hall-2)'] },
                    { id: '3', name: 'NON CRT CLASSES DAILY REPORT', headers: ['CLASS', '1ST HOUR (8:40-10:30)', '2ND HOUR (10:30-12:00)', '3RD HOUR (1:30-2:30)', '4TH HOUR (2:30-4:00)'], rows: ['nonCRT class 1 (A-210)'] }
                ];
                
                tables.forEach(table => {
                    csv += `${table.name}\n`;
                    csv += table.headers.join(',') + '\n';
                    
                    table.rows.forEach((rowName, rowIndex) => {
                        let row = [rowName];
                        for (let col = 1; col < table.headers.length; col++) {
                            const cellData = reportData[table.id]?.[rowIndex]?.[col];
                            if (cellData) {
                                let cellText = cellData.type.toUpperCase();
                                if (cellData.type === 'class') {
                                    if (cellData.crtFaculty) cellText += ` - CRT: ${cellData.crtFaculty}`;
                                    if (cellData.whichClass) cellText += ` - Class: ${cellData.whichClass}`;
                                    if (cellData.collegeFaculty) cellText += ` - Faculty: ${cellData.collegeFaculty}`;
                                } else if (cellData.practiceFaculty) {
                                    cellText += ` - Faculty: ${cellData.practiceFaculty}`;
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
                
                // Create CSV blob and download
                this.csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                this.csvFileName = `daily-report-${date}.csv`;
                
                this.downloadCSVFile();
                this.hideLoading();
                this.showCsvModal();
                
                console.log('CSV export completed');
            } catch (error) {
                this.hideLoading();
                this.showMessage('❌ Error exporting report', 'error');
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
        
        console.log('CSV file downloaded:', this.csvFileName);
    }

    showCsvModal() {
        const csvModal = document.getElementById('csvModal');
        const fileNameSpan = document.getElementById('fileName');
        
        if (csvModal && fileNameSpan) {
            fileNameSpan.textContent = this.csvFileName;
            csvModal.classList.remove('hidden');
            console.log('CSV modal shown');
        }
    }

    hideCsvModal() {
        const csvModal = document.getElementById('csvModal');
        if (csvModal) {
            csvModal.classList.add('hidden');
        }
    }

    downloadCSVAgain() {
        this.downloadCSVFile();
        this.showMessage('✅ File downloaded again!', 'success');
    }

    // Enhanced Share Modal with Multiple Platforms
    showShareModal() {
        const shareModal = document.getElementById('shareModal');
        const shareUrl = document.getElementById('shareUrl');
        
        if (shareModal && shareUrl) {
            shareUrl.value = window.location.href;
            shareModal.classList.remove('hidden');
            console.log('Share modal shown');
        }
    }

    hideShareModal() {
        const shareModal = document.getElementById('shareModal');
        if (shareModal) {
            shareModal.classList.add('hidden');
        }
    }

    shareToWhatsApp() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Check out this Daily Report application for B-Tech 4th Year class schedules!');
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
        this.showMessage('✅ Opening WhatsApp...', 'success');
    }

    shareToGmail() {
        const url = encodeURIComponent(window.location.href);
        const subject = encodeURIComponent('Daily Report - B-Tech 4th Year');
        const body = encodeURIComponent(`Check out this Daily Report application for tracking B-Tech 4th Year class schedules:\n\n${window.location.href}`);
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
        this.showMessage('✅ Opening Gmail...', 'success');
    }

    shareToFacebook() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        this.showMessage('✅ Opening Facebook...', 'success');
    }

    shareToTwitter() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Check out this Daily Report application for B-Tech 4th Year! 📚');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        this.showMessage('✅ Opening Twitter...', 'success');
    }

    shareToLinkedIn() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        this.showMessage('✅ Opening LinkedIn...', 'success');
    }

    shareToTelegram() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Check out this Daily Report application for B-Tech 4th Year class schedules!');
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
        this.showMessage('✅ Opening Telegram...', 'success');
    }

    async copyLinkToClipboard() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            this.showMessage('✅ Link copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            const dummy = document.createElement('textarea');
            document.body.appendChild(dummy);
            dummy.value = window.location.href;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            this.showMessage('✅ Link copied to clipboard!', 'success');
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
                this.showMessage('✅ Shared successfully!', 'success');
            } else {
                // Fallback to copy
                await this.copyLinkToClipboard();
            }
        } catch (error) {
            console.error('Share error:', error);
            await this.copyLinkToClipboard();
        }
    }

    // Fixed Access Management Modal
    showAccessManagement() {
        const accessModal = document.getElementById('accessModal');
        if (!accessModal) {
            console.error('Access modal not found');
            return;
        }
        
        this.updateAccessModalContent();
        accessModal.classList.remove('hidden');
        console.log('Access management modal shown');
    }

    hideAccessModal() {
        const accessModal = document.getElementById('accessModal');
        if (accessModal) {
            accessModal.classList.add('hidden');
        }
        
        const newEmailInput = document.getElementById('newEmail');
        if (newEmailInput) {
            newEmailInput.value = '';
        }
    }

    updateAccessModalContent() {
        // Update current status
        const currentUserEmail = document.getElementById('currentUserEmail');
        const currentAccessLevel = document.getElementById('currentAccessLevel');
        
        if (currentUserEmail) {
            currentUserEmail.textContent = this.currentUser || 'None';
        }
        
        if (currentAccessLevel) {
            currentAccessLevel.textContent = this.isAuthorized ? '✅ Authorized' : '❌ Unauthorized';
            currentAccessLevel.style.color = this.isAuthorized ? '#4a9eff' : '#ff6b6b';
        }
        
        // Update authorized emails list
        const emailsList = document.getElementById('authorizedEmailsList');
        if (emailsList) {
            let html = '';
            this.authorizedEmails.forEach((email, index) => {
                const isDefault = email === 'dhemanth369@gmail.com';
                html += `
                    <div class="email-item">
                        <span class="email-address">${email}${isDefault ? ' (Default)' : ''}</span>
                        ${!isDefault ? `<button class="remove-btn" onclick="window.app.removeAuthorizedEmail('${email}')">Remove</button>` : ''}
                    </div>
                `;
            });
            emailsList.innerHTML = html;
        }
    }

    addAuthorizedEmail() {
        const newEmailInput = document.getElementById('newEmail');
        const email = newEmailInput ? newEmailInput.value.trim().toLowerCase() : '';
        
        if (!email) {
            this.showMessage('⚠️ Please enter an email address', 'error');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showMessage('⚠️ Please enter a valid email address', 'error');
            return;
        }
        
        if (this.authorizedEmails.includes(email)) {
            this.showMessage('⚠️ This email is already authorized', 'error');
            return;
        }
        
        this.authorizedEmails.push(email);
        this.saveAuthorizedEmails();
        this.updateAccessModalContent();
        newEmailInput.value = '';
        this.showMessage(`✅ Added ${email} to authorized emails`, 'success');
    }

    removeAuthorizedEmail(email) {
        if (email === 'dhemanth369@gmail.com') {
            this.showMessage('❌ Cannot remove default admin email', 'error');
            return;
        }
        
        const index = this.authorizedEmails.indexOf(email);
        if (index > -1) {
            this.authorizedEmails.splice(index, 1);
            this.saveAuthorizedEmails();
            this.updateAccessModalContent();
            this.showMessage(`✅ Removed ${email} from authorized emails`, 'success');
        }
    }

    saveAuthorizedEmails() {
        try {
            localStorage.setItem('authorizedEmails', JSON.stringify(this.authorizedEmails));
            console.log('Authorized emails saved');
        } catch (error) {
            console.error('Error saving authorized emails:', error);
        }
    }

    loadAuthorizedEmails() {
        try {
            const saved = localStorage.getItem('authorizedEmails');
            if (saved) {
                const emails = JSON.parse(saved);
                // Always ensure default admin email is included
                if (!emails.includes('dhemanth369@gmail.com')) {
                    emails.unshift('dhemanth369@gmail.com');
                }
                this.authorizedEmails = emails;
                console.log('Authorized emails loaded:', this.authorizedEmails);
            }
        } catch (error) {
            console.error('Error loading authorized emails:', error);
        }
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.remove('hidden');
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.add('hidden');
    }

    saveCurrentReport() {
        console.log('Save current report called');
        
        if (!this.isAuthorized) {
            this.showMessage('❌ You need to be authorized to save reports', 'error');
            return;
        }

        this.showLoading();
        
        setTimeout(() => {
            const date = this.getCurrentDate();
            const success = this.saveReports();
            this.hideLoading();
            
            if (success) {
                this.showMessage(`✅ Report saved successfully for ${date}!`, 'success');
            } else {
                this.showMessage('❌ Error saving report', 'error');
            }
        }, 800);
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

    saveReports() {
        try {
            localStorage.setItem('dailyReports', JSON.stringify(this.reports));
            console.log('Reports saved to localStorage');
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

    showSavedReports() {
        console.log('Show saved reports called');
        const modal = document.getElementById('reportsModal');
        const reportsList = document.getElementById('reportsList');
        
        if (!modal || !reportsList) return;
        
        const dates = Object.keys(this.reports).sort().reverse();
        
        if (dates.length === 0) {
            reportsList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">
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
                                Load Report
                            </button>
                            <button class="btn btn--sm" onclick="window.app.deleteReport('${date}')" 
                                    style="background: #ff4444; color: white; border-color: #ff4444;">
                                Delete
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            reportsList.innerHTML = html;
        }
        
        modal.classList.remove('hidden');
        console.log('Saved reports modal shown');
    }

    hideSavedReports() {
        const modal = document.getElementById('reportsModal');
        if (modal) modal.classList.add('hidden');
    }

    loadReport(date) {
        const dateInput = document.getElementById('reportDate');
        if (dateInput) dateInput.value = date;
        
        this.loadCurrentReport();
        this.hideSavedReports();
        this.showMessage(`✅ Report loaded for ${date}`, 'success');
    }

    deleteReport(date) {
        if (confirm(`Are you sure you want to delete the report for ${date}?\n\nThis action cannot be undone.`)) {
            delete this.reports[date];
            this.saveReports();
            this.showSavedReports(); // Refresh the list
            this.showMessage(`✅ Report deleted for ${date}`, 'success');
        }
    }

    toggleMenu() {
        const dropdown = document.getElementById('menuDropdown');
        if (dropdown) {
            const isHidden = dropdown.classList.contains('hidden');
            dropdown.classList.toggle('hidden');
            console.log(`Menu toggled - now ${isHidden ? 'visible' : 'hidden'}`);
        }
    }

    hideMenu() {
        const dropdown = document.getElementById('menuDropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
            console.log('Menu hidden');
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        this.currentEditCell = null;
    }

    showMessage(message, type = 'success') {
        // Remove existing message
        const existing = document.querySelector('.status-message');
        if (existing) existing.remove();
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `status-message ${type}`;
        messageEl.textContent = message;
        
        // Insert after header
        const header = document.querySelector('.header');
        if (header) {
            header.insertAdjacentElement('afterend', messageEl);
        } else {
            document.body.insertBefore(messageEl, document.body.firstChild);
        }
        
        // Auto remove after 5 seconds with fade out
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.transition = 'opacity 0.3s ease';
                messageEl.style.opacity = '0';
                setTimeout(() => {
                    if (messageEl.parentNode) messageEl.remove();
                }, 300);
            }
        }, 5000);
        
        console.log(`Message shown: ${message} (${type})`);
    }
}

// Initialize app when DOM is ready
let app = null;

function initializeApp() {
    if (!app) {
        app = new DailyReportApp();
        // Make app globally available
        window.app = app;
        console.log('App instance created and made globally available');
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