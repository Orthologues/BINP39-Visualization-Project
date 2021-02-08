import gql from 'graphql-tag';

export const QUERY_GET_PDB_BASIC = gql`
    query GetPdbBasic($entry_id: String!) {
        entry(entry_id: $entry_id) {
            struct_keywords {
              pdbx_keywords
              text
            }
            struct {
              pdbx_CASP_flag
              pdbx_descriptor
              title
            }
            polymer_entities {
              entity_poly {
                rcsb_sample_sequence_length
              }
            }
            rcsb_entry_container_identifiers {
              rcsb_id
              entity_ids
              pubmed_id
              related_emdb_ids
              branched_entity_ids
              polymer_entity_ids
              non_polymer_entity_ids
            }
        }
    }
`;

export const QUERY_MAP_PDB_TO_UNIPROT = gql`
    query MapPdbToUniprot($entry_id: String!, $entity_id: String!) {
        polymer_entity(entry_id: $entry_id, entity_id: $entity_id) {
            entity_poly {
              pdbx_strand_id
              pdbx_seq_one_letter_code
              pdbx_seq_one_letter_code_can
              rcsb_mutation_count
              rcsb_conflict_count
              rcsb_insertion_count
              rcsb_deletion_count
            }
            rcsb_polymer_entity_container_identifiers {
              uniprot_ids
            }
            rcsb_polymer_entity {
              pdbx_number_of_molecules
              pdbx_description
              pdbx_mutation
            }
            rcsb_entity_host_organism {
              beg_seq_num
              common_name
              end_seq_num
              ncbi_parent_scientific_name
              ncbi_scientific_name
              ncbi_taxonomy_id
              provenance_source
              scientific_name
            }
            rcsb_entity_source_organism {
              beg_seq_num
              common_name
              end_seq_num
              ncbi_parent_scientific_name
              ncbi_scientific_name
              ncbi_taxonomy_id
              provenance_source
              scientific_name
              source_type
            }
        }
    }
`;

export const QUERY_GET_UNIPROT_BASIC = gql`
    query GetUniprotBasic($uniprot_id: String!) {
        uniprot(uniprot_id: $uniprot_id) {
            rcsb_uniprot_accession
            rcsb_uniprot_entry_name
            rcsb_uniprot_protein {
              sequence
            }
        }
    }
`;