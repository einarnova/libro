
import React, { useState } from 'react';
import { OdooControlPanel } from '../components/OdooControlPanel';

const INSTALLER_SCRIPT = `
import os
import sys

# ==========================================
# GENERADOR DE MÓDULO ODOO 18 ENTERPRISE
# ==========================================
# Este script genera automáticamente la estructura de carpetas y archivos
# para el módulo 'Libro de Reclamaciones Perú'.
#
# INSTRUCCIONES:
# 1. Guarda este código como 'instalar_modulo.py'
# 2. Ejecútalo: python instalar_modulo.py
# 3. Mueve la carpeta 'complaint_book' a tus addons de Odoo.

# --- CONTENIDO DE LOS ARCHIVOS ---

MANIFEST_CONTENT = """{
    'name': 'Libro de Reclamaciones Perú',
    'version': '18.0.1.0.0',
    'category': 'Website/Legal',
    'summary': 'Gestión de reclamos y quejas conforme a Indecopi',
    'description': "Módulo de Libro de Reclamaciones Virtual compatible con Odoo 18 Enterprise.",
    'author': 'Prime Electronics / Tu Empresa',
    'license': 'OPL-1',
    'depends': ['base', 'website', 'mail', 'portal'],
    'data': [
        'security/ir.model.access.csv',
        'data/ir_sequence_data.xml',
        'views/complaint_views.xml',
        'views/website_complaint_template.xml',
    ],
    'application': True,
    'installable': True,
}"""

INIT_CONTENT = """from . import models
from . import controllers"""

MODELS_INIT_CONTENT = """from . import complaint_book"""
CONTROLLERS_INIT_CONTENT = """from . import main"""

MODEL_CONTENT = """from odoo import models, fields, api, _

class ComplaintBook(models.Model):
    _name = 'complaint.book'
    _description = 'Libro de Reclamaciones'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(string='Código', required=True, copy=False, readonly=True, default=lambda self: _('Nuevo'), tracking=True)
    
    # 1. Identificación
    consumer_name = fields.Char(string='Consumidor', required=True, tracking=True)
    document_type = fields.Selection([
        ('DNI', 'DNI'), ('RUC', 'RUC'), ('CE', 'Carné Extranjería'), ('Pasaporte', 'Pasaporte')
    ], string='Tipo Doc.', default='DNI', required=True)
    document_number = fields.Char(string='N° Documento', required=True)
    email = fields.Char(string='Email', required=True)
    phone = fields.Char(string='Teléfono', required=True)
    address = fields.Char(string='Dirección', required=True)
    is_minor = fields.Boolean(string='Es menor de edad')
    guardian_name = fields.Char(string='Padre/Madre/Apoderado')

    # 2. Bien Contratado
    asset_type = fields.Selection([('Producto', 'Producto'), ('Servicio', 'Servicio')], string='Tipo de Bien', required=True, default='Producto')
    asset_description = fields.Char(string='Descripción del Bien', required=True)
    
    # Fix Enterprise: Campo monetario requiere currency_id (puede ser invisible)
    currency_id = fields.Many2one('res.currency', string='Moneda', default=lambda self: self.env.company.currency_id)
    amount_claimed = fields.Monetary(string='Monto Reclamado', currency_field='currency_id')

    # 3. Detalle
    type = fields.Selection([('Reclamo', 'Reclamo'), ('Queja', 'Queja')], string='Tipo', required=True, default='Reclamo', tracking=True)
    description = fields.Text(string='Detalle de los Hechos', required=True)
    consumer_request = fields.Text(string='Pedido del Consumidor', required=True)

    # Estado y Resolución
    state = fields.Selection([
        ('draft', 'Pendiente'), ('process', 'En Proceso'), ('done', 'Resuelto'), ('cancel', 'Anulado')
    ], string='Estado', default='draft', tracking=True, group_expand='_expand_states')
    
    company_response = fields.Text(string='Respuesta de la Empresa')
    resolution_date = fields.Date(string='Fecha de Resolución')

    @api.model
    def create(self, vals):
        if vals.get('name', _('Nuevo')) == _('Nuevo'):
            vals['name'] = self.env['ir.sequence'].next_by_code('complaint.book') or _('Nuevo')
        return super(ComplaintBook, self).create(vals)

    def _expand_states(self, states, domain, order):
        return [key for key, val in type(self).state.selection]

    def action_process(self): self.state = 'process'
    def action_done(self): 
        self.state = 'done'
        self.resolution_date = fields.Date.today()
    def action_cancel(self): self.state = 'cancel'
"""

SECURITY_CONTENT = """id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_complaint_book_user,complaint.book.user,model_complaint_book,base.group_user,1,1,1,1
access_complaint_book_manager,complaint.book.manager,model_complaint_book,base.group_system,1,1,1,1
access_complaint_book_public,complaint.book.public,model_complaint_book,base.group_public,0,0,1,0
"""

DATA_CONTENT = """<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <record id="seq_complaint_book" model="ir.sequence">
            <field name="name">Secuencia Libro Reclamaciones</field>
            <field name="code">complaint.book</field>
            <field name="prefix">LR-%(year)s-</field>
            <field name="padding">4</field>
            <field name="company_id" eval="False"/>
        </record>
    </data>
</odoo>
"""

VIEW_CONTENT = """<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- FORM VIEW -->
    <record id="view_complaint_book_form" model="ir.ui.view">
        <field name="name">complaint.book.form</field>
        <field name="model">complaint.book</field>
        <field name="arch" type="xml">
            <form string="Hoja de Reclamación">
                <header>
                    <button name="action_process" string="Atender" type="object" class="oe_highlight" invisible="state != 'draft'"/>
                    <button name="action_done" string="Resolver" type="object" class="oe_highlight" invisible="state != 'process'"/>
                    <button name="action_cancel" string="Anular" type="object" invisible="state in ('done','cancel')"/>
                    <field name="state" widget="statusbar" statusbar_visible="draft,process,done"/>
                </header>
                <sheet>
                    <div class="oe_button_box" name="button_box"></div>
                    <widget name="web_ribbon" title="Resuelto" bg_color="bg-success" invisible="state != 'done'"/>
                    <widget name="web_ribbon" title="Anulado" bg_color="bg-danger" invisible="state != 'cancel'"/>
                    <div class="oe_title">
                        <label for="name" class="oe_edit_only"/>
                        <h1><field name="name" readonly="1"/></h1>
                    </div>
                    <group>
                        <group string="Identificación">
                            <field name="consumer_name"/>
                            <field name="document_type"/>
                            <field name="document_number"/>
                            <field name="email" widget="email"/>
                            <field name="phone" widget="phone"/>
                            <field name="address"/>
                            <field name="is_minor"/>
                            <field name="guardian_name" invisible="not is_minor" required="is_minor"/>
                        </group>
                        <group string="Bien Contratado">
                            <field name="asset_type" widget="radio" options="{'horizontal': true}"/>
                            <field name="asset_description"/>
                            <field name="currency_id" invisible="1"/>
                            <field name="amount_claimed" widget="monetary"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Detalle">
                            <group>
                                <field name="type" widget="radio" options="{'horizontal': true}"/>
                                <field name="description"/>
                                <field name="consumer_request"/>
                            </group>
                        </page>
                        <page string="Resolución">
                            <group>
                                <field name="company_response"/>
                                <field name="resolution_date"/>
                            </group>
                        </page>
                    </notebook>
                </sheet>
                <chatter/>
            </form>
        </field>
    </record>

    <!-- LIST VIEW -->
    <record id="view_complaint_book_tree" model="ir.ui.view">
        <field name="name">complaint.book.tree</field>
        <field name="model">complaint.book</field>
        <field name="arch" type="xml">
            <tree string="Reclamaciones" decoration-info="state == 'draft'" decoration-warning="state == 'process'" decoration-success="state == 'done'" decoration-muted="state == 'cancel'">
                <field name="name"/>
                <field name="create_date" string="Fecha" widget="date"/>
                <field name="consumer_name"/>
                <field name="type" widget="badge" decoration-danger="type == 'Reclamo'" decoration-warning="type == 'Queja'"/>
                <field name="asset_description"/>
                <field name="amount_claimed" widget="monetary" options="{'currency_field': 'currency_id'}"/>
                <field name="currency_id" column_invisible="True"/>
                <field name="state" widget="badge" decoration-info="state == 'draft'" decoration-warning="state == 'process'" decoration-success="state == 'done'"/>
            </tree>
        </field>
    </record>

    <!-- KANBAN VIEW -->
    <record id="view_complaint_book_kanban" model="ir.ui.view">
        <field name="name">complaint.book.kanban</field>
        <field name="model">complaint.book</field>
        <field name="arch" type="xml">
            <kanban class="o_kanban_mobile" default_group_by="state" quick_create="false">
                <field name="name"/>
                <field name="consumer_name"/>
                <field name="asset_description"/>
                <field name="type"/>
                <field name="state"/>
                <field name="currency_id"/>
                <field name="amount_claimed"/>
                <templates>
                    <t t-name="kanban-box">
                        <div t-attf-class="oe_kanban_global_click">
                            <div class="o_kanban_record_top mb-1">
                                <div class="o_kanban_record_headings">
                                    <strong class="o_kanban_record_title"><field name="name"/></strong>
                                </div>
                                <span class="badge rounded-pill text-bg-light"><field name="state"/></span>
                            </div>
                            <div class="o_kanban_record_body">
                                <span class="fw-bold"><field name="consumer_name"/></span>
                                <div class="text-muted"><field name="asset_description"/></div>
                            </div>
                            <div class="o_kanban_record_bottom mt-2">
                                <div class="oe_kanban_bottom_left">
                                    <field name="type" widget="badge" decoration-danger="type == 'Reclamo'" decoration-warning="type == 'Queja'"/>
                                </div>
                                <div class="oe_kanban_bottom_right">
                                    <field name="create_date" widget="date"/>
                                </div>
                            </div>
                        </div>
                    </t>
                </templates>
            </kanban>
        </field>
    </record>

    <!-- ACTIONS -->
    <record id="action_complaint_book" model="ir.actions.act_window">
        <field name="name">Libro de Reclamaciones</field>
        <field name="res_model">complaint.book</field>
        <field name="view_mode">kanban,tree,form</field>
    </record>

    <menuitem id="menu_complaint_book_root" name="Reclamaciones" sequence="10" web_icon="complaint_book,static/description/icon.png"/>
    <menuitem id="menu_complaint_book_main" name="Reclamos" parent="menu_complaint_book_root" action="action_complaint_book" sequence="1"/>
</odoo>
"""

WEBSITE_CONTENT = """<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="menu_website_complaint" model="website.menu">
        <field name="name">Libro de Reclamaciones</field>
        <field name="url">/libro-reclamaciones</field>
        <field name="parent_id" ref="website.main_menu"/>
        <field name="sequence" type="int">90</field>
    </record>

    <template id="website_complaint_form" name="Libro de Reclamaciones">
        <t t-call="website.layout">
            <div id="wrap" class="oe_structure">
                <section class="s_website_form pt-5 pb-5">
                    <div class="container">
                        <div class="row justify-content-center">
                            <div class="col-lg-8 shadow-sm border rounded p-5 bg-white">
                                <h2 class="text-center mb-5 fw-bold">Libro de Reclamaciones Virtual</h2>
                                <form action="/libro-reclamaciones/submit" method="post" enctype="multipart/form-data">
                                    <input type="hidden" name="csrf_token" t-att-value="request.csrf_token()"/>
                                    
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Nombre Completo *</label>
                                        <input type="text" class="form-control" name="consumerName" required="required"/>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label fw-bold">Tipo Doc.</label>
                                            <select class="form-select" name="documentType">
                                                <option value="DNI">DNI</option>
                                                <option value="RUC">RUC</option>
                                                <option value="CE">C.E.</option>
                                            </select>
                                        </div>
                                        <div class="col-md-8 mb-3">
                                            <label class="form-label fw-bold">Número Documento *</label>
                                            <input type="text" class="form-control" name="documentNumber" required="required"/>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label fw-bold">Email *</label>
                                            <input type="email" class="form-control" name="email" required="required"/>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label fw-bold">Teléfono *</label>
                                            <input type="text" class="form-control" name="phone" required="required"/>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Dirección *</label>
                                        <input type="text" class="form-control" name="address" required="required"/>
                                    </div>
                                    
                                    <hr class="my-4"/>
                                    
                                    <h5 class="text-primary mb-3">Bien Contratado</h5>
                                    <div class="mb-3">
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name="assetType" value="Producto" checked="checked"/>
                                            <label class="form-check-label">Producto</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name="assetType" value="Servicio"/>
                                            <label class="form-check-label">Servicio</label>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Descripción del Bien *</label>
                                        <input type="text" class="form-control" name="assetDescription" required="required"/>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Monto Reclamado (S/)</label>
                                        <input type="number" step="0.01" class="form-control" name="amountClaimed"/>
                                    </div>

                                    <hr class="my-4"/>
                                    
                                    <h5 class="text-primary mb-3">Detalle</h5>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Tipo *</label>
                                        <select class="form-select" name="type">
                                            <option value="Reclamo">Reclamo (Producto/Servicio)</option>
                                            <option value="Queja">Queja (Atención)</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Detalle de los Hechos *</label>
                                        <textarea class="form-control" name="description" rows="5" required="required"></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Pedido del Consumidor *</label>
                                        <textarea class="form-control" name="consumerRequest" rows="3" required="required"></textarea>
                                    </div>
                                    
                                    <div class="form-check mb-4">
                                      <input class="form-check-input" type="checkbox" required="required"/>
                                      <label class="form-check-label small text-muted">
                                        Declaro que la información es verdadera y acepto las políticas de privacidad.
                                      </label>
                                    </div>

                                    <div class="text-center">
                                        <button type="submit" class="btn btn-warning w-100 fw-bold py-3">ENVIAR RECLAMO</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </t>
    </template>

    <template id="confirmation_page" name="Confirmación">
        <t t-call="website.layout">
             <div class="container py-5 text-center">
                <div class="bg-light p-5 rounded border shadow-sm d-inline-block" style="max-width: 600px;">
                    <h2 class="mb-3 text-success">¡Registrado con Éxito!</h2>
                    <p class="lead mb-4">Su código de seguimiento es:</p>
                    <div class="bg-white border rounded p-3 mb-4">
                        <h1 class="font-monospace text-primary m-0" t-field="complaint.name"/>
                    </div>
                    <p class="text-muted small">Guarde este código para consultar el estado de su reclamo.</p>
                    <a href="/" class="btn btn-outline-primary mt-3">Volver al Inicio</a>
                </div>
             </div>
        </t>
    </template>
</odoo>
"""

CONTROLLER_CONTENT = """from odoo import http
from odoo.http import request

class ComplaintWebsite(http.Controller):
    @http.route('/libro-reclamaciones', type='http', auth='public', website=True)
    def complaint_form(self, **kwargs):
        return request.render('complaint_book.website_complaint_form', {})

    @http.route('/libro-reclamaciones/submit', type='http', auth='public', website=True, methods=['POST'], csrf=True)
    def complaint_submit(self, **post):
        complaint = request.env['complaint.book'].sudo().create({
            'consumer_name': post.get('consumerName'),
            'document_type': post.get('documentType'),
            'document_number': post.get('documentNumber'),
            'email': post.get('email'),
            'phone': post.get('phone'),
            'address': post.get('address'),
            'asset_type': post.get('assetType'),
            'asset_description': post.get('assetDescription'),
            'amount_claimed': float(post.get('amountClaimed') or 0),
            'type': post.get('type'),
            'description': post.get('description'),
            'consumer_request': post.get('consumerRequest'),
        })
        return request.render('complaint_book.confirmation_page', {'complaint': complaint})
"""

# MAPEO DE ESTRUCTURA
structure = {
    "complaint_book/__init__.py": INIT_CONTENT,
    "complaint_book/__manifest__.py": MANIFEST_CONTENT,
    "complaint_book/models/__init__.py": MODELS_INIT_CONTENT,
    "complaint_book/models/complaint_book.py": MODEL_CONTENT,
    "complaint_book/security/ir.model.access.csv": SECURITY_CONTENT,
    "complaint_book/data/ir_sequence_data.xml": DATA_CONTENT,
    "complaint_book/views/complaint_views.xml": VIEW_CONTENT,
    "complaint_book/views/website_complaint_template.xml": WEBSITE_CONTENT,
    "complaint_book/controllers/__init__.py": CONTROLLERS_INIT_CONTENT,
    "complaint_book/controllers/main.py": CONTROLLER_CONTENT,
}

def create_module():
    base_path = os.getcwd()
    print(f"--- Generador de Módulo Odoo ---")
    print(f"Ruta: {base_path}")
    
    for file_path, content in structure.items():
        full_path = os.path.join(base_path, file_path)
        dir_name = os.path.dirname(full_path)
        
        if not os.path.exists(dir_name):
            os.makedirs(dir_name)
            
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content.strip())
            print(f"[OK] {file_path}")

    print("\\n--- ¡LISTO! ---")
    print("Carpeta 'complaint_book' creada correctamente.")

if __name__ == "__main__":
    create_module()
`;

const OdooModuleCode: React.FC = () => {
    const [activeTab, setActiveTab] = useState('installer');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Código copiado al portapapeles');
    };

    return (
        <div className="flex flex-col h-full bg-odoo-bg overflow-hidden">
            <OdooControlPanel 
                title="Generador de Módulo Odoo 18" 
                showCreate={false}
                showBack={true}
            />
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                    
                    {/* Instructions Panel */}
                    <div className="w-full lg:w-1/3 order-1 lg:order-2 space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
                            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-600">terminal</span>
                                Pasos para Instalar
                            </h3>
                            <div className="space-y-6 relative">
                                <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-gray-200"></div>
                                
                                <div className="flex gap-4 relative">
                                    <div className="bg-odoo-brand text-white font-bold size-6 rounded-full flex items-center justify-center shrink-0 z-10 text-xs">1</div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Copiar Script</p>
                                        <p className="text-xs text-gray-500 mt-1">Copia el código Python que aparece a la izquierda.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 relative">
                                    <div className="bg-odoo-brand text-white font-bold size-6 rounded-full flex items-center justify-center shrink-0 z-10 text-xs">2</div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Crear Archivo</p>
                                        <p className="text-xs text-gray-500 mt-1">Crea un archivo llamado <code>instalar.py</code> en tu PC y pega el código.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 relative">
                                    <div className="bg-odoo-brand text-white font-bold size-6 rounded-full flex items-center justify-center shrink-0 z-10 text-xs">3</div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Ejecutar</p>
                                        <code className="block bg-gray-100 p-2 rounded text-xs mt-1 border border-gray-200">python instalar.py</code>
                                    </div>
                                </div>

                                <div className="flex gap-4 relative">
                                    <div className="bg-green-600 text-white font-bold size-6 rounded-full flex items-center justify-center shrink-0 z-10 text-xs">4</div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Importar a Odoo</p>
                                        <p className="text-xs text-gray-500 mt-1">Mueve la carpeta generada <code>complaint_book</code> a tus addons, reinicia Odoo e instala.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-xs text-blue-800">
                            <strong>Nota Técnica:</strong> Este script genera un módulo completo con vistas Kanban, Listas, Formularios Web y ACLs de seguridad compatibles con Odoo 18 Enterprise.
                        </div>
                    </div>

                    {/* Code Editor Panel */}
                    <div className="flex-1 order-2 lg:order-1 bg-white shadow-sheet rounded border border-gray-300 overflow-hidden flex flex-col">
                        <div className="bg-[#212529] border-b border-gray-700 p-3 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-yellow-400">description</span>
                                <span className="font-mono text-sm">instalar_modulo.py</span>
                            </div>
                            <button 
                                onClick={() => copyToClipboard(INSTALLER_SCRIPT)}
                                className="bg-prime-yellow hover:bg-yellow-400 text-black px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                COPIAR CÓDIGO
                            </button>
                        </div>

                        <div className="relative bg-[#282c34] flex-1 min-h-[600px] overflow-hidden">
                            <pre className="p-6 overflow-auto h-full text-sm font-mono text-gray-300 leading-relaxed custom-scrollbar">
                                <code>{INSTALLER_SCRIPT.trim()}</code>
                            </pre>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OdooModuleCode;
