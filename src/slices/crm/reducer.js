import { createSlice } from "@reduxjs/toolkit";
import {
  getCollaborators,
  getContacts,
  getCompanies,
  getDeals,
  getLeads,
  addNewContact,
  addNewCollaborator,
  addNewCompanies,
  addNewLead,
  updateContact,
  deleteContact,
  updateCompanies,
  updateCollaborator,
  deleteCompanies,
  deleteCollaborator,
  updateLead,
  deleteLead,
} from "./thunk";

export const initialState = {
  crmcontacts: [],
  collaborators: [],
  companies: [],
  deals: [],
  leads: [],
  error: {},
};

const crmSlice = createSlice({
  name: "crm",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCollaborators.fulfilled, (state, action) => {
      state.collaborators = action.payload.data;
      state.isCollaboratorCreated = false;
      state.isCollaboratorSuccess = true;
    });    

    builder.addCase(getCollaborators.rejected, (state, action) => {
      state.error = action.payload.error || action.error.message;
      state.isCollaboratorCreated = false;
      state.isCollaboratorSuccess = false;
    });

    builder.addCase(addNewCollaborator.fulfilled, (state, action) => {
      state.collaborators.push(action.payload.data);
      state.isCollaboratorCreated = true;
      state.isCollaboratoAdd = true;
      state.isCollaboratoAddFail = false;
    });
    
    builder.addCase(addNewCollaborator.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isCollaboratoAdd = false;
      state.isCollaboratoAddFail = true;
    });

    builder.addCase(updateCollaborator.fulfilled, (state, action) => {
      state.collaborators = state.collaborators.map((collaborator) =>
        collaborator._id.toString() === action.payload.data._id.toString()
          ? { ...collaborator, ...action.payload.data }
          : collaborator
      );
      state.isCollaboratorCreated = true;
      state.isCollaboratoAdd = true;
      state.isCollaboratoAddFail = false;
    });

    builder.addCase(updateCollaborator.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isCollaboratorUpdate = false;
      state.isCollaboratorUpdateFail = true;
    });

    builder.addCase(deleteCollaborator.fulfilled, (state, action) => {
      state.collaborators = (state.collaborators || []).filter(
        (collaborator) =>
          collaborator._id.toString() !== action.payload.collaborator.toString()
      );
      state.isCollaboratorDelete = true;
      state.isCollaboratorDeleteFail = false;
    });

    builder.addCase(deleteCollaborator.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isCollaboratorDelete = false;
      state.isCollaboratorDeleteFail = true;
    });

    // Contacts
    builder.addCase(getContacts.fulfilled, (state, action) => {
      state.crmcontacts = action.payload.data;
      state.isContactCreated = false;
      state.isContactSuccess = true;
    });

    builder.addCase(getContacts.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isContactCreated = false;
      state.isContactSuccess = false;
    });

    builder.addCase(addNewContact.fulfilled, (state, action) => {
      state.crmcontacts.push(action.payload.data);
      state.isCompaniesCreated = true;
      state.isCompaniesAdd = true;
      state.isCompaniesAddFail = false;
    });

    builder.addCase(addNewContact.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isContactAdd = false;
      state.isContactAddFail = true;
    });

    builder.addCase(updateContact.fulfilled, (state, action) => {
      state.crmcontacts = state.crmcontacts.map((contact) =>
        contact._id.toString() === action.payload.data._id.toString()
          ? { ...contact, ...action.payload.data }
          : contact
      );
      state.isCompaniesCreated = true;
      state.isCompaniesAdd = true;
      state.isCompaniesAddFail = false;
    });

    builder.addCase(updateContact.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isContactUpdate = false;
      state.isContactUpdateFail = true;
    });

    builder.addCase(deleteContact.fulfilled, (state, action) => {
      state.crmcontacts = (state.crmcontacts || []).filter(
        (contact) =>
          contact._id.toString() !== action.payload.contact.toString()
      );
      state.isContactDelete = true;
      state.isContactDeleteFail = false;
    });

    builder.addCase(deleteContact.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isContactDelete = false;
      state.isContactDeleteFail = true;
    });

    builder.addCase(getCompanies.fulfilled, (state, action) => {
      state.companies = action.payload.data;
      state.isCompaniesCreated = false;
      state.isCompaniesSuccess = true;
    });

    builder.addCase(getCompanies.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isCompaniesCreated = false;
      state.isCompaniesSuccess = false;
    });

    builder.addCase(addNewCompanies.fulfilled, (state, action) => {
      state.companies.push(action.payload);
      state.isCompaniesCreated = false;
      state.isCompaniesSuccess = true;
    });

    builder.addCase(addNewCompanies.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isCompaniesCreated = false;
      state.isCompaniesSuccess = false;
    });

    builder.addCase(updateCompanies.fulfilled, (state, action) => {
      state.companies = state.companies.map((company) =>
        company._id.toString() === action.payload.data._id.toString()
          ? { ...company, ...action.payload.data }
          : company
      );
      state.isCompaniesUpdate = true;
      state.isCompaniesUpdateFail = false;
    });

    builder.addCase(updateCompanies.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isCompaniesUpdate = false;
      state.isCompaniesUpdateFail = true;
    });

    builder.addCase(deleteCompanies.fulfilled, (state, action) => {
      state.companies = state.companies.filter(
        (company) =>
          company._id.toString() !== action.payload.companies.toString()
      );
      state.isCompaniesDelete = true;
      state.isCompaniesDeleteFail = false;
    });

    builder.addCase(deleteCompanies.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isCompaniesDelete = false;
      state.isCompaniesDeleteFail = true;
    });

    builder.addCase(getDeals.fulfilled, (state, action) => {
      state.deals = action.payload;
    });

    builder.addCase(getDeals.rejected, (state, action) => {
      state.error = action.payload.error || null;
    });

    builder.addCase(getLeads.fulfilled, (state, action) => {
      state.leads = action.payload.data;
      state.isLeadCreated = false;
      state.isLeadsSuccess = true;
    });

    builder.addCase(getLeads.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isLeadCreated = false;
      state.isLeadsSuccess = false;
    });

    builder.addCase(addNewLead.fulfilled, (state, action) => {
      state.leads.push(action.payload.data);
      state.isLeadCreated = true;
      state.isLeadsAdd = true;
      state.isLeadsAddFail = false;
    });

    builder.addCase(addNewLead.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isLeadsAdd = false;
      state.isLeadsAddFail = true;
    });

    builder.addCase(updateLead.fulfilled, (state, action) => {
      state.leads = state.leads.map((lead) =>
        lead._id.toString() === action.payload.data._id.toString()
          ? { ...lead, ...action.payload.data }
          : lead
      );
      state.isLeadsUpdate = true;
      state.isLeadsUpdateFail = false;
    });

    builder.addCase(updateLead.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isLeadsUpdate = false;
      state.isLeadsUpdateFail = true;
    });

    builder.addCase(deleteLead.fulfilled, (state, action) => {
      state.leads = state.leads.filter(
        (lead) => lead._id.toString() !== action.payload.leads.toString()
      );
      state.isLeadsDelete = true;
      state.isLeadsDeleteFail = false;
    });

    builder.addCase(deleteLead.rejected, (state, action) => {
      state.error = action.payload.error || null;
      state.isLeadsDelete = false;
      state.isLeadsDeleteFail = true;
    });
  },
});

export default crmSlice.reducer;
