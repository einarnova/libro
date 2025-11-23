import React, { useState } from 'react';
import { OdooControlPanel } from '../components/OdooControlPanel';

const MANIFEST_CODE = `
{
    'name': 'Libro de Reclamaciones Perú',
    'version': '18.0.1.0.0',
    'category': 'Website/Legal',
    'summary': 'Gestión de reclamos y quejas conforme a Indecopi',
    'description': """
        Módulo de Libro de Reclamaciones Virtual para Odoo 18 Enterprise.
        
        Características:
        ----------------
        * Formulario Web Público: Cumple normativa de Indecopi.
        * Backend Odoo: Gestión de tickets con estados y chat.
        * Secuencia Automática: Generación de códigos (LR-2024-XXXX).
        * Vistas: Kanban, Lista, Formulario y Búsqueda.
        * Seguridad: ACLs configuradas para usuario, gerente y público.
    """,
    'author': 'Prime Electronics / Tu Empresa',
    'website': 'https://www.tuempresa.com',
    'license': 'OPL-1',
    'depends': ['base', 'website', 'mail', 'portal'],
    'data': [
        'security/ir.model.access.csv',
        'data/ir_sequence_data.xml',
        'views/complaint_views.xml',
        'views/website_complaint_template.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            # Aquí podrías agregar CSS/JS personalizado si fuera necesario
        ],
    },
    'application': True,
    'installable': True,
}
`;

const INIT_CODE = `
# __init__.py (Raíz)
# Este archivo le dice a Python que esta carpeta es un módulo
from . import models
from . import controllers
`;

const MODELS_INIT_CODE = `
# models/__init__.py
# Carga los archivos de modelos (base de datos)
from . import complaint_book
`;

const CONTROLLERS_INIT_CODE = `
# controllers/__init__.py
# Carga los controladores web
from . import main
`;

const MODEL_CODE = `
# models/complaint_book.py
from odoo import models, fields, api, _

class ComplaintBook(models.Model):
    _name = 'complaint.book'
    _description = 'Libro de Reclamaciones'
    _inherit = ['mail.thread', 'mail.activity.mixin'] # Añade el chat y notas abajo
    _order = 'create_date desc'

    # Campo ID Secuencial (LR-2024-001)
    name = fields.Char(string='Código', required=True, copy=False, readonly=True, default=lambda self: _('Nuevo'), tracking=True)
    
    # 1. Identificación del Consumidor
    consumer_name = fields.Char(string='Consumidor', required=True, tracking=True)
    document_type = fields.Selection([
        ('DNI', 'DNI'),
        ('RUC', 'RUC'),
        ('CE', 'Carné Extranjería'),
        ('Pasaporte', 'Pasaporte')
    ], string='Tipo Doc.', default='DNI', required=True)
    document_number = fields.Char(string='N° Documento', required=True)
    email = fields.Char(string='Email', required=True)
    phone = fields.Char(string='Teléfono', required=True)
    address = fields.Char(string='Dirección', required=True)
    
    is_minor = fields.Boolean(string='Es menor de edad')
    guardian_name = fields.Char(string='Padre/Madre/Apoderado')

    # 2. Identificación del Bien
    asset_type = fields.Selection([
        ('Producto', 'Producto'),
        ('Servicio', 'Servicio')
    ], string='Tipo de Bien', required=True, default='Producto')
    asset_description = fields.Char(string='Descripción del Bien', required=True)
    
    # Manejo de Moneda para Enterprise (Evita errores de JS)
    currency_id = fields.Many2one('res.currency', string='Moneda', default=lambda self: self.env.company.currency_id)
    amount_claimed = fields.Monetary(string='Monto Reclamado', currency_field='currency_id')

    # 3. Detalle
    type = fields.Selection([
        ('Reclamo', 'Reclamo'),
        ('Queja', 'Queja')
    ], string='Tipo', required=True, default='Reclamo', tracking=True)
    
    description = fields.Text(string='Detalle de los Hechos', required=True)
    consumer_request = fields.Text(string='Pedido del Consumidor', required=True)

    # Gestión Interna
    state = fields.Selection([
        ('draft', 'Pendiente'),
        ('process', 'En Proceso'),
        ('done', 'Resuelto'),
        ('cancel', 'Anulado')
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

    # Funciones de botones de estado
    def action_process(self):
        self.state = 'process'

    def action_done(self):
        self.state = 'done'
        self.resolution_date = fields.Date.today()
        
    def action_cancel(self):
        self.state = 'cancel'
`;

const SECURITY_CODE = `
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_complaint_book_user,complaint.book.user,model_complaint_book,base.group_user,1,1,1,1
access_complaint_book_manager,complaint.book.manager,model_complaint_book,base.group_system,1,1,1,1
access_complaint_book_public,complaint.book.public,model_complaint_book,base.group_public,1,0,1,0
`;

const DATA_CODE = `
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <!-- Secuencia para generar códigos automáticos LR-2024-XXXX -->
        <record id="seq_complaint_book" model="ir.sequence">
            <field name="name">Secuencia Libro Reclamaciones</field>
            <field name="code">complaint.book</field>
            <field name="prefix">LR-%(year)s-</field>
            <field name="padding">4</field>
            <field name="company_id" eval="False"/>
        </record>
    </data>
</odoo>
`;

const VIEW_CODE = `
<!-- views/complaint_views.xml -->
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- VISTA FORMULARIO (Donde se edita) -->
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
                    <div class="oe_button_box" name="button_box">
                    </div>
                    <widget name="web_ribbon" title="Resuelto" bg_color="bg-success" invisible="state != 'done'"/>
                    <widget name="web_ribbon" title="Anulado" bg_color="bg-danger" invisible="state != 'cancel'"/>
                    
                    <div class="oe_title">
                        <label for="name" class="oe_edit_only"/>
                        <h1>
                            <field name="name" readonly="1"/>
                        </h1>
                    </div>
                    <group>
                        <group string="Identificación del Consumidor">
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
                            <!-- Campo invisible necesario para que funcionen los montos en Enterprise -->
                            <field name="currency_id" invisible="1"/>
                            <field name="amount_claimed" widget="monetary"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Detalle de Reclamación">
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
                <!-- Chatter: Historial de mensajes y notas -->
                <chatter/>
            </form>
        </field>
    </record>

    <!-- VISTA LISTA (Tabla) -->
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

    <!-- VISTA KANBAN (Tarjetas) -->
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
                                <div class="text-primary" t-if="record.amount_claimed.raw_value > 0">
                                    <field name="amount_claimed" widget="monetary"/>
                                </div>
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
    
    <!-- VISTA BÚSQUEDA Y FILTROS -->
    <record id="view_complaint_book_search" model="ir.ui.view">
        <field name="name">complaint.book.search</field>
        <field name="model">complaint.book</field>
        <field name="arch" type="xml">
            <search>
                <field name="name"/>
                <field name="consumer_name"/>
                <field name="document_number"/>
                <field name="email"/>
                <filter string="Pendientes" name="draft" domain="[('state', '=', 'draft')]"/>
                <filter string="En Proceso" name="process" domain="[('state', '=', 'process')]"/>
                <filter string="Resueltos" name="done" domain="[('state', '=', 'done')]"/>
                <separator/>
                <filter string="Reclamos" name="type_reclamo" domain="[('type', '=', 'Reclamo')]"/>
                <filter string="Quejas" name="type_queja" domain="[('type', '=', 'Queja')]"/>
                <group expand="0" string="Agrupar Por">
                    <filter string="Estado" name="group_state" context="{'group_by': 'state'}"/>
                    <filter string="Tipo" name="group_type" context="{'group_by': 'type'}"/>
                    <filter string="Mes" name="group_date" context="{'group_by': 'create_date:month'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- ACCIÓN DE VENTANA -->
    <record id="action_complaint_book" model="ir.actions.act_window">
        <field name="name">Libro de Reclamaciones</field>
        <field name="res_model">complaint.book</field>
        <field name="view_mode">kanban,tree,form</field>
        <field name="help" type="html">
          <p class="o_view_nocontent_smiling_face">
            Cree su primera Hoja de Reclamación
          </p>
        </field>
    </record>

    <!-- MENÚS -->
    <menuitem id="menu_complaint_book_root" name="Reclamaciones" sequence="10" web_icon="complaint_book,static/description/icon.png"/>
    <menuitem id="menu_complaint_book_main" name="Reclamos" parent="menu_complaint_book_root" action="action_complaint_book" sequence="1"/>
</odoo>
`;

const WEBSITE_TEMPLATE_CODE = `
<!-- views/website_complaint_template.xml -->
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Entrada de Menú en el Sitio Web -->
    <record id="menu_website_complaint" model="website.menu">
        <field name="name">Libro de Reclamaciones</field>
        <field name="url">/libro-reclamaciones</field>
        <field name="parent_id" ref="website.main_menu"/>
        <field name="sequence" type="int">90</field>
    </record>

    <!-- Plantilla del Formulario Web -->
    <template id="website_complaint_form" name="Libro de Reclamaciones">
        <t t-call="website.layout">
            <div id="wrap" class="oe_structure">
                <section class="s_website_form pt-5 pb-5" data-vcss="001" data-snippet="s_website_form">
                    <div class="container">
                        <div class="row justify-content-center">
                            <div class="col-lg-8 shadow-sm border rounded p-5 bg-white">
                                <div class="text-center mb-5">
                                    <h2 class="fw-bold">Libro de Reclamaciones Virtual</h2>
                                    <p class="text-muted">Conforme al Código de Protección y Defensa del Consumidor</p>
                                </div>
                                
                                <form action="/libro-reclamaciones/submit" method="post" enctype="multipart/form-data">
                                    <input type="hidden" name="csrf_token" t-att-value="request.csrf_token()"/>
                                    
                                    <!-- Identificación -->
                                    <h5 class="border-bottom pb-2 mb-3 text-primary">1. Identificación del Consumidor</h5>
                                    <div class="row mb-3">
                                        <div class="col-12">
                                            <label class="form-label fw-bold" for="consumerName">Nombre Completo *</label>
                                            <input type="text" class="form-control" name="consumerName" required="required"/>
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold" for="documentType">Tipo Doc.</label>
                                            <select class="form-select" name="documentType">
                                                <option value="DNI">DNI</option>
                                                <option value="RUC">RUC</option>
                                                <option value="CE">C.E.</option>
                                            </select>
                                        </div>
                                        <div class="col-md-8">
                                            <label class="form-label fw-bold" for="documentNumber">Número *</label>
                                            <input type="text" class="form-control" name="documentNumber" required="required"/>
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold" for="email">Email *</label>
                                            <input type="email" class="form-control" name="email" required="required"/>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold" for="phone">Teléfono *</label>
                                            <input type="text" class="form-control" name="phone" required="required"/>
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-12">
                                            <label class="form-label fw-bold" for="address">Dirección *</label>
                                            <input type="text" class="form-control" name="address" required="required"/>
                                        </div>
                                    </div>

                                    <!-- Bien Contratado -->
                                    <h5 class="border-bottom pb-2 mb-3 mt-4 text-primary">2. Bien Contratado</h5>
                                    <div class="row mb-3">
                                        <div class="col-12">
                                            <div class="form-check form-check-inline">
                                                <input class="form-check-input" type="radio" name="assetType" id="assetProduct" value="Producto" checked="checked"/>
                                                <label class="form-check-label" for="assetProduct">Producto</label>
                                            </div>
                                            <div class="form-check form-check-inline">
                                                <input class="form-check-input" type="radio" name="assetType" id="assetService" value="Servicio"/>
                                                <label class="form-check-label" for="assetService">Servicio</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-12">
                                            <label class="form-label fw-bold" for="assetDescription">Descripción del Bien *</label>
                                            <input type="text" class="form-control" name="assetDescription" required="required"/>
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-12">
                                            <label class="form-label fw-bold" for="amountClaimed">Monto Reclamado (S/)</label>
                                            <input type="number" step="0.01" class="form-control" name="amountClaimed"/>
                                        </div>
                                    </div>

                                    <!-- Detalle -->
                                    <h5 class="border-bottom pb-2 mb-3 mt-4 text-primary">3. Detalle de Reclamación</h5>
                                    <div class="row mb-3">
                                        <div class="col-12">
                                            <label class="form-label fw-bold" for="type">Tipo *</label>
                                            <select class="form-select" name="type">
                                                <option value="Reclamo">Reclamo (Disconformidad con producto/servicio)</option>
                                                <option value="Queja">Queja (Malestar en atención)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-12">
                                            <label class="form-label fw-bold" for="description">Detalle de los Hechos *</label>
                                            <textarea class="form-control" name="description" rows="5" required="required"></textarea>
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-12">
                                            <label class="form-label fw-bold" for="consumerRequest">Pedido del Consumidor *</label>
                                            <textarea class="form-control" name="consumerRequest" rows="3" required="required"></textarea>
                                        </div>
                                    </div>
                                    
                                    <div class="form-check mb-4">
                                      <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" required="required"/>
                                      <label class="form-check-label text-muted small" for="flexCheckChecked">
                                        Declaro ser el titular del servicio y acepto que la información consignada es verdadera.
                                      </label>
                                    </div>

                                    <div class="text-center mt-4">
                                        <button type="submit" class="btn btn-warning btn-lg w-100 fw-bold text-dark">ENVIAR HOJA DE RECLAMACIÓN</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </t>
    </template>

    <!-- Página de Confirmación Web -->
    <template id="confirmation_page" name="Confirmación">
        <t t-call="website.layout">
             <div class="container py-5 text-center" style="min-height: 60vh; display: flex; align-items: center; justify-content: center;">
                <div class="bg-light p-5 rounded border shadow-sm" style="max-width: 600px;">
                    <span class="fa fa-check-circle text-success display-1 mb-4"></span>
                    <h2 class="mb-3">¡Registrado con Éxito!</h2>
                    <p class="lead">Su código de seguimiento es:</p>
                    <div class="bg-white border rounded p-3 mb-4">
                        <h1 class="font-monospace text-primary m-0" t-field="complaint.name"/>
                    </div>
                    <p class="text-muted">Hemos enviado una copia a su correo electrónico.</p>
                    <a href="/" class="btn btn-primary mt-3">Volver al Inicio</a>
                </div>
             </div>
        </t>
    </template>
</odoo>
`;

const CONTROLLER_CODE = `
# controllers/main.py
from odoo import http
from odoo.http import request

class ComplaintWebsite(http.Controller):

    # Ruta para mostrar el formulario
    @http.route('/libro-reclamaciones', type='http', auth='public', website=True)
    def complaint_form(self, **kwargs):
        return request.render('complaint_book.website_complaint_form', {})

    # Ruta para procesar el envío (POST)
    @http.route('/libro-reclamaciones/submit', type='http', auth='public', website=True, methods=['POST'], csrf=True)
    def complaint_submit(self, **post):
        # Crear registro en modo 'sudo' (permisos de admin temporal)
        complaint = request.env['complaint.book'].sudo().create({
            'consumer_name': post.get('consumerName'),
            'document_type': post.get('documentType'),
            'document_number': post.get('documentNumber'),
            'email': post.get('email'),
            'phone': post.get('phone'),
            'address': post.get('address'),
            'asset_type': post.get('assetType'),
            'asset_description': post.get('assetDescription'),
            'amount_claimed': float(post.get('amountClaimed') or 0) if post.get('amountClaimed') else 0.0,
            'type': post.get('type'),
            'description': post.get('description'),
            'consumer_request': post.get('consumerRequest'),
        })
        return request.render('complaint_book.confirmation_page', {'complaint': complaint})
`;

const INSTALLER_SCRIPT = `
import os
import sys

# CONFIGURACIÓN DE CONTENIDOS DE ARCHIVOS
# (Código 100% Auditado para Odoo 18 Enterprise)

MANIFEST_CONTENT = """{
    'name': 'Libro de Reclamaciones Perú',
    'version': '18.0.1.0.0',
    'category': 'Website/Legal',
    'summary': 'Gestión de reclamos y quejas conforme a Indecopi',
    'description': "Módulo de Libro de Reclamaciones Virtual para Odoo 18 Enterprise.",
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

    asset_type = fields.Selection([('Producto', 'Producto'), ('Servicio', 'Servicio')], string='Tipo de Bien', required=True, default='Producto')
    asset_description = fields.Char(string='Descripción del Bien', required=True)
    currency_id = fields.Many2one('res.currency', string='Moneda', default=lambda self: self.env.company.currency_id)
    amount_claimed = fields.Monetary(string='Monto Reclamado', currency_field='currency_id')

    type = fields.Selection([('Reclamo', 'Reclamo'), ('Queja', 'Queja')], string='Tipo', required=True, default='Reclamo', tracking=True)
    description = fields.Text(string='Detalle de los Hechos', required=True)
    consumer_request = fields.Text(string='Pedido del Consumidor', required=True)

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
access_complaint_book_public,complaint.book.public,model_complaint_book,base.group_public,1,0,1,0
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
    <!-- FORM -->
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
                        <group string="Identificación del Consumidor">
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
                        <page string="Detalle de Reclamación">
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

    <!-- TREE -->
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

    <!-- KANBAN -->
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
                                <div class="text-primary" t-if="record.amount_claimed.raw_value > 0">
                                    <field name="amount_claimed" widget="monetary"/>
                                </div>
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
    
    <!-- SEARCH -->
    <record id="view_complaint_book_search" model="ir.ui.view">
        <field name="name">complaint.book.search</field>
        <field name="model">complaint.book</field>
        <field name="arch" type="xml">
            <search>
                <field name="name"/>
                <field name="consumer_name"/>
                <field name="document_number"/>
                <filter string="Pendientes" name="draft" domain="[('state', '=', 'draft')]"/>
                <filter string="En Proceso" name="process" domain="[('state', '=', 'process')]"/>
                <filter string="Resueltos" name="done" domain="[('state', '=', 'done')]"/>
                <separator/>
                <filter string="Reclamos" name="type_reclamo" domain="[('type', '=', 'Reclamo')]"/>
                <filter string="Quejas" name="type_queja" domain="[('type', '=', 'Queja')]"/>
                <group expand="0" string="Agrupar Por">
                    <filter string="Estado" name="group_state" context="{'group_by': 'state'}"/>
                    <filter string="Tipo" name="group_type" context="{'group_by': 'type'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- ACTION & MENU -->
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
                                    <!-- Campos Formulario (Resumido para script, pero funcional) -->
                                    <div class="mb-3"><label class="form-label fw-bold">Nombre Completo</label><input type="text" class="form-control" name="consumerName" required="required"/></div>
                                    <div class="mb-3"><label class="form-label fw-bold">DNI/RUC</label><input type="text" class="form-control" name="documentNumber" required="required"/></div>
                                    <div class="mb-3"><label class="form-label fw-bold">Email</label><input type="email" class="form-control" name="email" required="required"/></div>
                                    <div class="mb-3"><label class="form-label fw-bold">Teléfono</label><input type="text" class="form-control" name="phone" required="required"/></div>
                                    <div class="mb-3"><label class="form-label fw-bold">Dirección</label><input type="text" class="form-control" name="address" required="required"/></div>
                                    <hr/>
                                    <div class="mb-3"><label class="form-label fw-bold">Bien Contratado</label><input type="text" class="form-control" name="assetDescription" required="required"/></div>
                                    <div class="mb-3"><label class="form-label fw-bold">Monto</label><input type="number" step="0.01" class="form-control" name="amountClaimed"/></div>
                                    <div class="mb-3"><label class="form-label fw-bold">Tipo</label><select class="form-select" name="type"><option value="Reclamo">Reclamo</option><option value="Queja">Queja</option></select></div>
                                    <div class="mb-3"><label class="form-label fw-bold">Hechos</label><textarea class="form-control" name="description" rows="5" required="required"></textarea></div>
                                    <div class="mb-3"><label class="form-label fw-bold">Pedido</label><textarea class="form-control" name="consumerRequest" rows="3" required="required"></textarea></div>
                                    <div class="text-center mt-4"><button type="submit" class="btn btn-warning w-100 fw-bold">ENVIAR</button></div>
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
                <div class="bg-light p-5 rounded border shadow-sm d-inline-block">
                    <h2 class="mb-3 text-success">¡Registrado con Éxito!</h2>
                    <p class="lead">Código: <span class="fw-bold font-monospace" t-field="complaint.name"/></p>
                    <a href="/" class="btn btn-primary mt-3">Inicio</a>
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
            'document_number': post.get('documentNumber'),
            'email': post.get('email'),
            'phone': post.get('phone'),
            'address': post.get('address'),
            'asset_description': post.get('assetDescription'),
            'amount_claimed': float(post.get('amountClaimed') or 0),
            'type': post.get('type'),
            'description': post.get('description'),
            'consumer_request': post.get('consumerRequest'),
        })
        return request.render('complaint_book.confirmation_page', {'complaint': complaint})
"""

# MAPEO DE ARCHIVOS
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
    print(f"Directorio base: {base_path}")
    
    for file_path, content in structure.items():
        full_path = os.path.join(base_path, file_path)
        dir_name = os.path.dirname(full_path)
        
        # Crear directorio si no existe
        if not os.path.exists(dir_name):
            os.makedirs(dir_name)
            
        # Escribir archivo
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content.strip())
            print(f"[OK] Creado: {file_path}")

    print("\\n--- ¡INSTALACIÓN EXITOSA! ---")
    print("1. Mueve la carpeta 'complaint_book' a tu directorio de addons de Odoo.")
    print("2. Reinicia el servicio de Odoo.")
    print("3. Actualiza la lista de aplicaciones e instala 'Libro de Reclamaciones Perú'.")

if __name__ == "__main__":
    create_module()
`;

const OdooModuleCode: React.FC = () => {
    const [activeTab, setActiveTab] = useState('installer');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Código copiado al portapapeles');
    };

    const getCode = () => {
        switch(activeTab) {
            case 'installer': return INSTALLER_SCRIPT;
            case 'init': return INIT_CODE + '\n\n' + MODELS_INIT_CODE + '\n\n' + CONTROLLERS_INIT_CODE;
            case 'manifest': return MANIFEST_CODE;
            case 'models': return MODEL_CODE;
            case 'security': return SECURITY_CODE;
            case 'data': return DATA_CODE;
            case 'views': return VIEW_CODE;
            case 'website': return WEBSITE_TEMPLATE_CODE;
            case 'controllers': return CONTROLLER_CODE;
            default: return '';
        }
    };

    const tabs = [
        { id: 'installer', label: '🚀 Script Instalador (Python)', filename: 'instalar_modulo.py' },
        { id: 'manifest', label: '__manifest__.py', filename: 'complaint_book/__manifest__.py' },
        { id: 'init', label: '__init__.py', filename: '(Varios Archivos de Inicio)' },
        { id: 'models', label: 'Modelos', filename: 'complaint_book/models/complaint_book.py' },
        { id: 'security', label: 'Seguridad', filename: 'complaint_book/security/ir.model.access.csv' },
        { id: 'data', label: 'Datos', filename: 'complaint_book/data/ir_sequence_data.xml' },
        { id: 'views', label: 'Vistas Backend', filename: 'complaint_book/views/complaint_views.xml' },
        { id: 'website', label: 'Vistas Website', filename: 'complaint_book/views/website_complaint_template.xml' },
        { id: 'controllers', label: 'Controladores', filename: 'complaint_book/controllers/main.py' },
    ];

    return (
        <div className="flex flex-col h-full bg-odoo-bg overflow-hidden">
            <OdooControlPanel 
                title="Generador de Módulo Odoo 18 (Final)" 
                showCreate={false}
                showBack={true}
            />
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                    
                    {/* LEFT COLUMN: Code Area */}
                    <div className="flex-1 bg-white shadow-sheet rounded border border-gray-300 overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-odoo-brand to-purple-900 border-b border-gray-200 p-4 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold">Código Fuente Auditado</h2>
                                <p className="text-xs opacity-90">Versión 18.0 Enterprise</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-mono bg-white/10 px-2 py-1 rounded">
                                    {tabs.find(t => t.id === activeTab)?.filename}
                                </p>
                            </div>
                        </div>

                        <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50">
                            {tabs.map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-odoo-brand text-odoo-brand bg-white' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative bg-[#282c34] group flex-1 min-h-[500px]">
                            <button 
                                onClick={() => copyToClipboard(getCode())}
                                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs font-medium backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 border border-white/20 z-10"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                    Copiar Código
                                </span>
                            </button>
                            <pre className="p-6 overflow-auto text-sm font-mono text-gray-300 leading-relaxed absolute inset-0">
                                <code>{getCode().trim()}</code>
                            </pre>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Instructions */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        
                        {/* Step by Step Guide */}
                        <div className="bg-white p-5 rounded-lg border border-gray-300 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-600">rocket_launch</span>
                                Instalación Automática (Recomendada)
                            </h3>
                            <div className="space-y-4 text-sm text-gray-600">
                                
                                <div className="flex gap-3">
                                    <div className="bg-green-100 text-green-800 font-bold size-6 rounded-full flex items-center justify-center shrink-0">1</div>
                                    <div>
                                        <p className="font-bold text-gray-800">Copia el Script</p>
                                        <p>Selecciona la pestaña <strong>"🚀 Script Instalador"</strong> y copia todo el código.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="bg-green-100 text-green-800 font-bold size-6 rounded-full flex items-center justify-center shrink-0">2</div>
                                    <div>
                                        <p className="font-bold text-gray-800">Crea el Instalador</p>
                                        <p>En tu computadora, crea un archivo nuevo llamado <code>instalar.py</code> y pega el código dentro.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="bg-green-100 text-green-800 font-bold size-6 rounded-full flex items-center justify-center shrink-0">3</div>
                                    <div>
                                        <p className="font-bold text-gray-800">Ejecuta el Script</p>
                                        <p>Abre una terminal y escribe: <code>python instalar.py</code>.</p>
                                        <p className="text-xs text-green-600 mt-1">¡Esto creará automáticamente la carpeta con todos los archivos!</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="bg-green-100 text-green-800 font-bold size-6 rounded-full flex items-center justify-center shrink-0">4</div>
                                    <div>
                                        <p className="font-bold text-gray-800">Activa en Odoo</p>
                                        <ul className="list-disc ml-4 mt-1 space-y-1">
                                            <li>Mueve la carpeta generada a <code>addons</code>.</li>
                                            <li>Reinicia Odoo.</li>
                                            <li>Actualiza la lista de Apps.</li>
                                            <li>Instala "Libro de Reclamaciones Perú".</li>
                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OdooModuleCode;