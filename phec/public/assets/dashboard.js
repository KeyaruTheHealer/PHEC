// Rebuilt, cleaned asset JS for dashboard
// NOTE: this file is a simplified, standalone copy used by the public/assets variant of the dashboard.
// It intentionally mirrors the behavior in the main dashboard HTML but avoids duplicate global declarations when both are loaded.

// If your main HTML already includes Firebase and these globals, you can keep this file as an independent copy.

// Minimal config placeholder - replace in deployment as needed
const ASSET_FIREBASE_CONFIG = {
    apiKey: "AIzaSyC_YOUR_API_KEY",
    authDomain: "phecsystem.firebaseapp.com",
    projectId: "phecsystem",
    storageBucket: "phecsystem.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase only if not already present
if (!window.__phec_assets_initialized) {
    try {
        firebase.initializeApp(ASSET_FIREBASE_CONFIG);
    } catch (e) { /* ignore if already initialized */ }
    window.__phec_assets_initialized = true;
}

const db_asset = firebase.firestore();

let casesListener_asset = null;

document.addEventListener('DOMContentLoaded', () => {
    try { initializeTabs(); initializeModals(); loadNotifications(); loadCases(); loadRescuers(); setupFirestoreListener(); } catch (e) { console.error(e); }
});

function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabName)?.classList.add('active');
    }));
}

function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close');
    closeBtns.forEach(btn => btn.addEventListener('click', () => modals.forEach(m => m.style.display = 'none')));
    window.addEventListener('click', (e) => { if (e.target.classList && e.target.classList.contains('modal')) e.target.style.display = 'none'; });
}

function setupFirestoreListener() {
    if (casesListener_asset) return;
    casesListener_asset = db_asset.collection('cases').orderBy('sentAt', 'desc')
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const caseData = change.doc.data();
                    const sentAt = caseData.sentAt?.toDate();
                    const now = new Date();
                    const diffSeconds = sentAt ? (now - sentAt) / 1000 : 0;
                    if (diffSeconds < 5) { showNotification('New case received: ' + change.doc.id); loadNotifications(); updateNotificationBadge(); }
                }
                if (change.type === 'modified') { const casesTab = document.getElementById('cases'); if (casesTab?.classList.contains('active')) loadCases(); }
            });
        }, err => console.error('Firestore listener error (assets):', err));
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') new Notification('PHEC Hospital', { body: message, icon: '/favicon.ico' });
}

async function loadNotifications() {
    const container = document.getElementById('notificationsList'); if (!container) return;
    container.innerHTML = '<div class="loading">Loading notifications...</div>';
    try {
        const snapshot = await db_asset.collection('cases').where('status', '==', 'Pending').orderBy('sentAt', 'desc').get();
        if (snapshot.empty) { container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔕</div><div class="empty-state-text">No pending cases</div></div>`; updateNotificationBadge(0); return; }
        container.innerHTML = ''; updateNotificationBadge(snapshot.size);
        snapshot.forEach(doc => container.appendChild(createCaseCard(doc.id, doc.data(), true)));
    } catch (err) { console.error('Error loading notifications (assets):', err); container.innerHTML = `<div class="loading">Error loading notifications</div>`; }
}

function updateNotificationBadge(count) { const badge = document.getElementById('notifBadge'); if (!badge) return; if (count === undefined) db_asset.collection('cases').where('status', '==', 'Pending').get().then(s => badge.textContent = s.size); else badge.textContent = count; }

async function loadCases() {
    const container = document.getElementById('casesList'); if (!container) return; const statusFilterEl = document.querySelector('.status-tabs .status-tab.active'); const statusFilter = statusFilterEl ? statusFilterEl.dataset.status : '';
    container.innerHTML = '<div class="loading">Loading cases...</div>';
    try {
        let query = db_asset.collection('cases').orderBy('sentAt', 'desc'); if (statusFilter) query = query.where('status', '==', statusFilter);
        const snapshot = await query.get(); if (snapshot.empty) { container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No cases found</div></div>`; return; }
        container.innerHTML = ''; snapshot.forEach(doc => container.appendChild(createCaseCard(doc.id, doc.data(), false)));
    } catch (err) { console.error('Error loading cases (assets):', err); container.innerHTML = `<div class="loading">Error loading cases</div>`; }
}

function createCaseCard(caseId, caseData, isNotification) {
    const card = document.createElement('div'); const statusClass = caseData?.status ? `status-${caseData.status.toString().toLowerCase()}` : 'status-pending'; card.className = `case-card ${statusClass}`;
    const sentAt = caseData.sentAt?.toDate(); const formattedDate = sentAt ? sentAt.toLocaleString() : 'N/A'; const attachmentCount = caseData.attachments?.length || 0; const triageKey = getTriageColor(caseData.triage); const triageLabel = getTriageLabel(caseData.triage);
    card.innerHTML = `
        <div class="case-header">
            <div class="case-id">${caseId}</div>
            <div class="status-badge status-${caseData?.status?.toString().toLowerCase()}">${caseData?.status || ''}</div>
        </div>
        <div class="case-info">
            <div class="info-item"><div class="info-label">Patient Name</div><div class="info-value">${caseData.patientName || 'N/A'}</div></div>
            <div class="info-item"><div class="info-label">Age / Sex</div><div class="info-value">${caseData.patientAge || '?'} / ${caseData.patientSex || '?'}</div></div>
            <div class="info-item"><div class="info-label">Condition</div><div class="info-value">${(caseData.condition || 'N/A').substring(0,50)}...</div></div>
            <div class="info-item"><div class="info-label">Sent At</div><div class="info-value">${formattedDate}</div></div>
        </div>
        <div class="case-footer">
            <div class="triage-badge triage-${triageKey}" title="${caseData.triage || ''}">${triageLabel}</div>
            <div class="attachment-count">📎 ${attachmentCount} attachment(s)</div>
        </div>
    `;
    card.addEventListener('click', () => openCaseDetail(caseId, caseData, isNotification)); return card;
}

function getTriageColor(triage) { if (!triage) return 'green'; const t = triage.toString().toLowerCase(); if (t.includes('red') || t.includes('immediate') || t.includes('critical') || t.includes('p1')) return 'red'; if (t.includes('yellow') || t.includes('urgent') || t.includes('delayed') || t.includes('p2')) return 'yellow'; if (t.includes('black') || t.includes('deceased') || t.includes('expectant')) return 'black'; return 'green'; }

// Human-friendly triage labels with descriptions.
// Keep CSS classes (triage-red / triage-yellow / triage-green / triage-black) for colouring only.
function getTriageLabel(triage) {
    if (!triage) return 'Green - Minor (Stable)';
    const t = triage.toString().toLowerCase();
    if (t.includes('red') || t.includes('immediate') || t.includes('critical') || t.includes('p1') || t.includes('priority 1')) return 'Red - Immediate (Life-Threatening)';
    if (t.includes('yellow') || t.includes('urgent') || t.includes('delayed') || t.includes('p2') || t.includes('priority 2')) return 'Yellow - Delayed (Serious)';
    if (t.includes('black') || t.includes('deceased') || t.includes('expectant')) return 'Black - Deceased';
    return 'Green - Minor (Stable)';
}

async function openCaseDetail(caseId, caseData, fromNotification) {
    const modal = document.getElementById('caseModal'); const detailDiv = document.getElementById('caseDetail'); if (!detailDiv) return; if (fromNotification && caseData?.status && caseData.status.toString().toLowerCase() === 'pending') { const triageKey = getTriageColor(caseData.triage); const newStatus = triageKey === 'black' ? 'deceased' : 'active'; await updateCaseStatus(caseId, newStatus); caseData.status = newStatus; loadNotifications(); loadCases(); }
    const attachmentsHTML = await generateAttachmentsHTML(caseData.attachments || []);
    const detailTriageKey = getTriageColor(caseData.triage); const detailTriageLabel = getTriageLabel(caseData.triage);
    detailDiv.innerHTML = `
        <div class="detail-header">
            <h2 class="detail-title">${caseId}</h2>
            <div class="status-badge status-${caseData?.status?.toString().toLowerCase()}">${caseData?.status || ''}</div>
        </div>
        <div class="detail-section">
            <h3>👤 Patient Information</h3>
            <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Full Name</div><div class="detail-value">${caseData.patientName || 'N/A'}</div></div>
                <div class="detail-item"><div class="detail-label">Age</div><div class="detail-value">${caseData.patientAge || 'N/A'}</div></div>
                <div class="detail-item"><div class="detail-label">Sex</div><div class="detail-value">${caseData.patientSex || 'N/A'}</div></div>
                <div class="detail-item"><div class="detail-label">Contact</div><div class="detail-value">${caseData.patientContact || 'N/A'}</div></div>
            </div>
        </div>
        <div class="detail-section">
            <h3>🚨 Triage & Condition</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Triage Category</div>
                    <div class="detail-value">
                        <span class="triage-badge triage-${detailTriageKey}" title="${caseData.triage || ''}">${detailTriageLabel}</span>
                        ${caseData.triage ? `<small style="display:block; color:#666; margin-top:6px;">Original: ${caseData.triage}</small>` : ''}
                    </div>
                </div>
                <div class="detail-item"><div class="detail-label">Chief Complaint / Condition</div><div class="detail-value">${caseData.condition || 'N/A'}</div></div>
            </div>
        </div>
        <div class="detail-section">
            <h3>💊 Vitals</h3>
            <div class="vitals-grid">
                <div class="detail-item"><div class="detail-label">Blood Pressure</div><div class="detail-value">${caseData.vitals?.bpSystolic || '?'} / ${caseData.vitals?.bpDiastolic || '?'} mmHg</div></div>
                <div class="detail-item"><div class="detail-label">Heart Rate</div><div class="detail-value">${caseData.vitals?.heartRate || 'N/A'} bpm</div></div>
                <div class="detail-item"><div class="detail-label">Respiratory Rate</div><div class="detail-value">${caseData.vitals?.respiratoryRate || 'N/A'} /min</div></div>
                <div class="detail-item"><div class="detail-label">Temperature</div><div class="detail-value">${caseData.vitals?.temperature || 'N/A'} °C</div></div>
                <div class="detail-item"><div class="detail-label">SpO₂</div><div class="detail-value">${caseData.vitals?.spo2 || 'N/A'} %</div></div>
            </div>
        </div>
        <div class="detail-section">
            <h3>📎 Attachments</h3>
            ${attachmentsHTML}
        </div>
        <div class="detail-section">
            <h3>👨‍⚕️ Hospital Information</h3>
            <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Sent By</div><div class="detail-value">${caseData.rescuerName || 'Unknown'}</div></div>
                <div class="detail-item"><div class="detail-label">Sent At</div><div class="detail-value">${caseData.sentAt?.toDate().toLocaleString() || 'N/A'}</div></div>
                <div class="detail-item"><div class="detail-label">Last Updated</div><div class="detail-value">${caseData.lastUpdated?.toDate().toLocaleString() || 'N/A'}</div></div>
            </div>
            <div class="status-update">
                <select class="status-select" id="statusSelect">
                    <option value="Pending" ${caseData.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Active" ${caseData.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Discharged" ${caseData.status === 'Discharged' ? 'selected' : ''}>Discharged</option>
                    <option value="Transferred" ${caseData.status === 'Transferred' ? 'selected' : ''}>Transferred</option>
        
        <div class="detail-section">
            <h3>🏥 Pre-Hospital Care</h3>
            <div class="detail-item">
                <div class="detail-label">Interventions</div>
                <div class="detail-value">${caseData.interventions || 'None recorded'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Remarks</div>
                <div class="detail-value">${caseData.remarks || 'None'}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>📎 Attachments</h3>
            ${attachmentsHTML}
        </div>
        
        <div class="detail-section">
            <h3>👨‍⚕️ Hospital Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Sent By</div>
                    <div class="detail-value">${caseData.rescuerName || 'Unknown'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Sent At</div>
                    <div class="detail-value">${caseData.sentAt?.toDate().toLocaleString() || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Last Updated</div>
                    <div class="detail-value">${caseData.lastUpdated?.toDate().toLocaleString() || 'N/A'}</div>
                </div>
            </div>
            
            <div class="status-update">
                <select class="status-select" id="statusSelect" ${caseData.status === 'Deceased' || caseData.status === 'deceased' ? 'disabled' : ''}>
                    <option value="Pending" ${caseData.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Active" ${caseData.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Discharged" ${caseData.status === 'Discharged' ? 'selected' : ''}>Discharged</option>
                    <option value="Transferred" ${caseData.status === 'Transferred' ? 'selected' : ''}>Transferred</option>
                    <option value="Deceased" ${caseData.status === 'Deceased' ? 'selected' : ''}>Deceased</option>
                </select>
                <button class="btn-update" onclick="saveStatusUpdate('${caseId}')" ${caseData.status === 'Deceased' || caseData.status === 'deceased' ? 'disabled' : ''}>Update Status</button>
                ${caseData.status === 'Deceased' || caseData.status === 'deceased' ? '<div style="color: #666; font-size: 14px; margin-top: 8px;">⚠️ Status cannot be changed for deceased cases</div>' : ''}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Generate attachments HTML with Cloudinary URLs
async function generateAttachmentsHTML(attachments) {
    if (!attachments || attachments.length === 0) {
        return '<div class="detail-value">No attachments</div>';
    }
    
    let html = '<div class="attachments-grid">';
    
    for (const attachment of attachments) {
        const url = attachment.remoteUrl || attachment.url;
        const mimeType = attachment.mimeType || '';
        const isVideo = mimeType.startsWith('video/');
        const isImage = mimeType.startsWith('image/');
        
        html += `<div class="attachment-item">`;
        
        if (isImage) {
            // Cloudinary image with thumbnail transformation
            const thumbnailUrl = url.replace('/upload/', '/upload/w_300,h_200,c_fill/');
            html += `<a href="${url}" target="_blank">
                        <img src="${thumbnailUrl}" alt="Attachment" />
                     </a>`;
        } else if (isVideo) {
            // Cloudinary video with controls
            html += `<video controls>
                        <source src="${url}" type="${mimeType}">
                        Your browser does not support video playback.
                     </video>`;
        } else {
            html += `<div style="padding: 20px; text-align: center;">📄 File</div>`;
        }
        
        html += `<div class="attachment-info">
                    <a href="${url}" target="_blank" class="attachment-link">View Full Size</a>
                 </div>
              </div>`;
    }
    
    html += '</div>';
    return html;
}

// Update case status
async function updateCaseStatus(caseId, newStatus) {
    try {
        await db.collection('cases').doc(caseId).update({
            status: newStatus,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating status:', error);
        return false;
    }
}

// Save status update from modal
async function saveStatusUpdate(caseId) {
    const newStatus = document.getElementById('statusSelect').value;
    const success = await updateCaseStatus(caseId, newStatus);
    
    if (success) {
        alert('Status updated successfully!');
        document.getElementById('caseModal').style.display = 'none';
        loadNotifications();
        loadCases();
    } else {
        alert('Failed to update status. Please try again.');
    }
}

// Refresh buttons
document.getElementById('refreshNotif').addEventListener('click', loadNotifications);
document.getElementById('refreshCases').addEventListener('click', loadCases);
document.getElementById('statusFilter').addEventListener('change', loadCases);

// Load Rescuers
async function loadRescuers() {
    const container = document.getElementById('rescuersList');
    container.innerHTML = '<div class="loading">Loading rescuers...</div>';
    
    try {
        const response = await fetch('../api/rescuers.php?action=list');
        const data = await response.json();
        
        if (!data.success) {
            container.innerHTML = `<div class="loading">Error: ${data.error}</div>`;
            return;
        }
        
        if (data.rescuers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-text">No rescuers found</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        data.rescuers.forEach(rescuer => {
            const card = createRescuerCard(rescuer);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading rescuers:', error);
        container.innerHTML = `<div class="loading">Error loading rescuers</div>`;
    }
}

// Create rescuer card
function createRescuerCard(rescuer) {
    const card = document.createElement('div');
    card.className = 'rescuer-card';
    
    card.innerHTML = `
        <div class="case-header">
            <div class="case-id">${rescuer.full_name}</div>
            <div class="status-badge ${rescuer.active ? 'status-active' : 'status-deceased'}">
                ${rescuer.active ? 'Active' : 'Inactive'}
            </div>
        </div>
        <div class="case-info">
            <div class="info-item">
                <div class="info-label">Username</div>
                <div class="info-value">${rescuer.username}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${rescuer.phone || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${rescuer.email || 'N/A'}</div>
            </div>
        </div>
        <div class="case-footer">
            <button class="btn-delete" onclick="deleteRescuer(${rescuer.id}, '${rescuer.full_name}')">🗑️ Delete</button>
        </div>
    `;
    
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-delete')) {
            openRescuerForm(rescuer);
        }
    });
    
    return card;
}

// Add Rescuer button
document.getElementById('addRescuerBtn').addEventListener('click', () => {
    openRescuerForm(null);
});

// Open rescuer form modal
function openRescuerForm(rescuer) {
    const modal = document.getElementById('rescuerModal');
    const formDiv = document.getElementById('rescuerForm');
    
    const isEdit = rescuer !== null;
    
    formDiv.innerHTML = `
        <h2>${isEdit ? 'Edit' : 'Add'} Rescuer</h2>
        <form id="rescuerFormElement">
            <input type="hidden" id="rescuerId" value="${rescuer?.id || ''}">
            
            <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="fullName" value="${rescuer?.full_name || ''}" required>
            </div>
            
            <div class="form-group">
                <label>Username *</label>
                <input type="text" id="username" value="${rescuer?.username || ''}" required>
            </div>
            
            <div class="form-group">
                <label>Password ${isEdit ? '(leave blank to keep current)' : '*'}</label>
                <input type="password" id="password" ${!isEdit ? 'required' : ''}>
            </div>
            
            <div class="form-group">
                <label>Phone</label>
                <input type="text" id="phone" value="${rescuer?.phone || ''}">
            </div>
            
            <div class="form-group">
                <label>Email</label>
                <input type="text" id="email" value="${rescuer?.email || ''}">
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn-cancel" onclick="closeRescuerModal()">Cancel</button>
                <button type="submit" class="btn-save">Save</button>
            </div>
        </form>
    `;
    
    document.getElementById('rescuerFormElement').addEventListener('submit', saveRescuer);
    
    modal.style.display = 'block';
}

// Close rescuer modal
function closeRescuerModal() {
    document.getElementById('rescuerModal').style.display = 'none';
}

// Save rescuer
async function saveRescuer(e) {
    e.preventDefault();
    
    const id = document.getElementById('rescuerId').value;
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    
    const data = {
        action: id ? 'update' : 'create',
        id,
        full_name: fullName,
        username,
        password,
        phone,
        email
    };
    
    try {
        const response = await fetch('../api/rescuers.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Rescuer saved successfully!');
            closeRescuerModal();
            loadRescuers();
        } else {
            alert('Error: ' + (result.error || 'Failed to save rescuer'));
        }
    } catch (error) {
        console.error('Error saving rescuer:', error);
        alert('Failed to save rescuer. Please try again.');
    }
}

// Delete rescuer
async function deleteRescuer(id, name) {
    if (!confirm(`Are you sure you want to delete rescuer "${name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch('../api/rescuers.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Rescuer deleted successfully!');
            loadRescuers();
        } else {
            alert('Error: ' + (result.error || 'Failed to delete rescuer'));
        }
    } catch (error) {
        console.error('Error deleting rescuer:', error);
        alert('Failed to delete rescuer. Please try again.');
    }
}

// Make functions globally accessible
window.saveStatusUpdate = saveStatusUpdate;
window.closeRescuerModal = closeRescuerModal;
window.deleteRescuer = deleteRescuer;
